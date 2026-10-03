from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlmodel import Session, select
from typing import List, Dict, Any, Optional
from datetime import datetime

from backend.database import get_session
from backend.models import PublicRecruit, PublicRecruitCreate, PublicRecruitUpdate, Job, Interview
from backend.services.public_sector import PublicSectorService

router = APIRouter(prefix="/api/public-sector", tags=["Public Sector Recruitment"])

_last_public_refresh_time: float = 0.0

def _refresh_status(recruits: List[PublicRecruit], session: Session, force: bool = False):
    """动态刷新考录时效状态 (带60秒冷却保护，避免高频请求击穿数据库)"""
    global _last_public_refresh_time
    now = datetime.now().timestamp()
    if not force and (now - _last_public_refresh_time) < 60.0:
        return
    changed = False
    for item in recruits:
        new_status = PublicSectorService.calculate_status(item.apply_start_date, item.apply_end_date)
        if item.status != new_status:
            item.status = new_status
            session.add(item)
            changed = True
    if changed:
        session.commit()
    _last_public_refresh_time = now

@router.get("/", response_model=List[PublicRecruit])
async def get_public_recruits(
    category: Optional[str] = Query(None, description="编制分类: 公务员(国考/省考), 选调生, 事业单位, 央企国企, 军队文职/其他"),
    region: Optional[str] = Query(None, description="所属省份/地区: 全国, 北京, 广东, 上海, 江苏, 浙江, 山东, 四川, 湖北等"),
    status: Optional[str] = Query(None, description="状态: hot, upcoming, ending, closed"),
    keyword: Optional[str] = Query(None, description="关键词搜索"),
    session: Session = Depends(get_session)
):
    """获取体制内考公考编与国企招录列表（严格不自动注入任何假数据，纯净初始状态）"""
    global _last_public_refresh_time
    if (datetime.now().timestamp() - _last_public_refresh_time) >= 60.0:
        recruits = session.exec(select(PublicRecruit)).all()
        if recruits:
            _refresh_status(recruits, session)

    query = select(PublicRecruit)

    if category and category != "all":
        query = query.where(PublicRecruit.category.like(f"%{category}%"))

    if region and region != "all":
        query = query.where(PublicRecruit.region.like(f"%{region}%"))

    if status and status != "all":
        query = query.where(PublicRecruit.status == status)

    if keyword and keyword.strip():
        kw = f"%{keyword.strip()}%"
        query = query.where(
            (PublicRecruit.title.like(kw)) |
            (PublicRecruit.organization.like(kw)) |
            (PublicRecruit.roles_summary.like(kw)) |
            (PublicRecruit.region.like(kw)) |
            (PublicRecruit.category.like(kw))
        )

    # 优先展示即将截止与进行中
    query = query.order_by(
        PublicRecruit.status == "ending",
        PublicRecruit.updated_at.desc()
    )
    return session.exec(query).all()

@router.get("/stats")
def get_public_sector_stats(session: Session = Depends(get_session)) -> Dict[str, Any]:
    """获取考公考编与央国企大盘分类统计概览"""
    items = session.exec(select(PublicRecruit)).all()
    total = len(items)
    ending_count = sum(1 for r in items if r.status == "ending")
    civil_servant_count = sum(1 for r in items if "公务员" in r.category or "国考" in r.category or "省考" in r.category)
    talent_scout_count = sum(1 for r in items if "选调" in r.category)
    institution_count = sum(1 for r in items if "事业" in r.category)
    soe_count = sum(1 for r in items if "国企" in r.category or "央企" in r.category)

    return {
        "total_recruits": total,
        "ending_count": ending_count,
        "civil_servant_count": civil_servant_count,
        "talent_scout_count": talent_scout_count,
        "institution_count": institution_count,
        "soe_count": soe_count
    }

@router.post("/sync")
async def sync_public_recruits(session: Session = Depends(get_session)):
    """主动从公开开源渠道同步最新体制内与央国企真实招录日程"""
    synced_items = await PublicSectorService.sync_from_open_sources()
    count_added = 0
    count_updated = 0

    for s in synced_items:
        existing = session.exec(
            select(PublicRecruit).where(
                PublicRecruit.organization == s["organization"],
                PublicRecruit.title == s["title"]
            )
        ).first()

        if not existing:
            new_item = PublicRecruit.model_validate(s)
            session.add(new_item)
            count_added += 1
        else:
            if s.get("apply_url"): existing.apply_url = s["apply_url"]
            if s.get("announcement_url"): existing.announcement_url = s["announcement_url"]
            if s.get("roles_summary"): existing.roles_summary = s["roles_summary"]
            if s.get("headcount") and s["headcount"] != "详见官方招聘简章": existing.headcount = s["headcount"]
            if s.get("apply_start_date"): existing.apply_start_date = s["apply_start_date"]
            if s.get("apply_end_date"): existing.apply_end_date = s["apply_end_date"]
            if s.get("exam_date"): existing.exam_date = s["exam_date"]
            if s.get("announcement_text"): existing.announcement_text = s["announcement_text"]
            if s.get("category"): existing.category = s["category"]
            if s.get("region"): existing.region = s["region"]
            if s.get("target_graduates"): existing.target_graduates = s["target_graduates"]
            if s.get("status"): existing.status = s["status"]
            existing.updated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            session.add(existing)
            count_updated += 1

    session.commit()
    total_count = len(session.exec(select(PublicRecruit)).all())
    return {
        "message": f"🎉 成功同步！新增 {count_added} 条招考日程，刷新 {count_updated} 条，当前库中共聚合 {total_count} 条真实体制与国企招考！",
        "total_active": total_count
    }

@router.post("/import-to-job/{recruit_id}")
def import_public_recruit_to_job(recruit_id: int, session: Session = Depends(get_session)):
    """一键将某条考公/国企招录导入求职看板，并自动同步在日历中创建【报名截止提醒】与【笔试统考提醒】"""
    recruit = session.get(PublicRecruit, recruit_id)
    if not recruit:
        raise HTTPException(status_code=404, detail="招考记录不存在")

    job_title = f"{recruit.category} - {recruit.title}"
    tags_str = f"体制内,{recruit.category},{recruit.region},编制招录"
    if recruit.headcount:
        tags_str += f",招录{recruit.headcount}"

    jd_content = f"【招考公告全称】: {recruit.title}\n【招录单位/部门】: {recruit.organization}\n【所属区域】: {recruit.region}\n【编制类型】: {recruit.category}\n【面向对象】: {recruit.target_graduates}\n【招录人数】: {recruit.headcount or '详见简章'}\n【官方报名入口】: {recruit.apply_url or '详见各省人事考试网'}\n【职位表/公告出处】: {recruit.announcement_url or ''}\n\n【招录专业要求与岗位类别】:\n{recruit.roles_summary}\n\n【招考报考流程与核心条件】:\n{recruit.announcement_text or ''}"

    new_job = Job(
        title=job_title,
        company=recruit.organization,
        location=recruit.region,
        salary="体制内规范薪资 / 政策标准",
        status="wishlist",
        source=f"考公专区 ({recruit.source})",
        source_url=recruit.apply_url or recruit.source_url or "",
        tags=tags_str,
        priority=1,
        resume_version="体制考公针对版",
        resume_key_points=f"针对 {recruit.organization} {recruit.roles_summary} 准备行测、申论与专业科目备考。",
        jd_text=jd_content
    )
    session.add(new_job)
    session.commit()
    session.refresh(new_job)

    created_events = []

    # 1. 自动创建报名截止日历提醒
    if recruit.apply_end_date:
        dl_time = f"{recruit.apply_end_date} 18:00"
        reg_event = Interview(
            job_id=new_job.id,
            round_name=f"【报名截止】{recruit.organization} ({recruit.category})",
            interview_time=dl_time,
            meeting_link=recruit.apply_url or "人事考试网报名入口",
            interviewer="报名倒计时提醒",
            questions_notes=f"官方报名链接：{recruit.apply_url or '无'}\n招考人数：{recruit.headcount}\n请务必在 {recruit.apply_end_date} 前完成网上报名、上传照片并缴纳考务费！",
            retrospective="已在日历中建立报名备忘。"
        )
        session.add(reg_event)
        session.commit()
        session.refresh(reg_event)
        created_events.append(reg_event)

    # 2. 自动创建笔试统考日历提醒
    if recruit.exam_date:
        exam_time = f"{recruit.exam_date} 09:00"
        exam_event = Interview(
            job_id=new_job.id,
            round_name=f"【笔试统考】{recruit.title}",
            interview_time=exam_time,
            meeting_link="详见准考证考点考场",
            interviewer="统一笔试考场",
            questions_notes=f"笔试科目：行测/申论/专业科目统考\n准考证打印请提前关注：{recruit.apply_url}\n带齐身份证、准考证与考试文具！",
            retrospective="已在日历中建立笔试考前提醒。"
        )
        session.add(exam_event)
        session.commit()
        session.refresh(exam_event)
        created_events.append(exam_event)

    return {
        "message": f"🎉 已成功将「{recruit.organization}」转入备考看板！并在日历中自动生成了 {len(created_events)} 个备考关键节点提醒。",
        "job": Job.model_validate(new_job).model_dump(),
        "events_count": len(created_events)
    }

@router.post("/parse-article")
async def parse_public_recruit_article(
    payload: Dict[str, Any] = Body(..., description="article_text: 微信公众号或人事考试网推文长文本, source_url: 可选链接"),
    session: Session = Depends(get_session)
):
    """利用 LLM 大模型对微信公众号推文或人事网公告长文进行全自动结构化提取并入库"""
    article_text = payload.get("article_text", "")
    source_url = payload.get("source_url", "")

    parse_res = await PublicSectorService.extract_from_article_with_llm(article_text, source_url)
    if not parse_res["success"]:
        raise HTTPException(status_code=400, detail=parse_res.get("error", "提取失败"))

    data = parse_res["recruit_data"]

    existing = session.exec(
        select(PublicRecruit).where(
            PublicRecruit.title == data["title"],
            PublicRecruit.organization == data["organization"]
        )
    ).first()

    if existing:
        for k, v in data.items():
            if v:
                setattr(existing, k, v)
        existing.updated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        session.add(existing)
        session.commit()
        session.refresh(existing)
        saved = existing
    else:
        new_recruit = PublicRecruit.model_validate(data)
        session.add(new_recruit)
        session.commit()
        session.refresh(new_recruit)
        saved = new_recruit

    return {
        "message": f"🎉 已成功从真实推文中提取「{saved.title}」并录入考公专区！",
        "recruit": saved
    }

@router.delete("/purge/all")
def purge_all_public_recruits(session: Session = Depends(get_session)):
    """清空所有考公考编记录，恢复 100% 绝对纯净状态"""
    items = session.exec(select(PublicRecruit)).all()
    count = len(items)
    for it in items:
        session.delete(it)
    session.commit()
    return {"message": f"已清空本地全部 {count} 条考公考编记录。"}

@router.delete("/{recruit_id}")
def delete_public_recruit(recruit_id: int, session: Session = Depends(get_session)):
    """删除单条招考记录"""
    rec = session.get(PublicRecruit, recruit_id)
    if not rec:
        raise HTTPException(status_code=404, detail="记录不存在")
    session.delete(rec)
    session.commit()
    return {"message": "已删除该条招考信息", "id": recruit_id}
