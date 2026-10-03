from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Dict, Any

from backend.database import get_session
from backend.models import Offer, OfferCreate, OfferUpdate
from backend.services.offer_calculator import OfferCalculatorService

router = APIRouter(prefix="/api/offers", tags=["Offers"])

@router.get("/", response_model=List[Offer])
def get_offers(session: Session = Depends(get_session)):
    """获取所有已录入的 Offer 列表"""
    offers = session.exec(select(Offer).order_by(Offer.updated_at.desc())).all()
    return offers

@router.post("/", response_model=Offer)
def create_offer(offer_in: OfferCreate, session: Session = Depends(get_session)):
    """新建 Offer 记录"""
    offer = Offer.model_validate(offer_in)
    session.add(offer)
    session.commit()
    session.refresh(offer)
    return offer

@router.get("/compare/all")
def compare_all_offers(session: Session = Depends(get_session)) -> List[Dict[str, Any]]:
    """获取所有 Offer 的详细量化对比指标与雷达图数据"""
    offers = session.exec(select(Offer).order_by(Offer.updated_at.desc())).all()
    if not offers:
        return []
    results = [OfferCalculatorService.calculate_offer_metrics(o) for o in offers]
    # 按综合得分从高到低排序
    results.sort(key=lambda x: x["overall_score"], reverse=True)
    return results

@router.get("/{offer_id}")
def get_offer_detail(offer_id: int, session: Session = Depends(get_session)):
    """获取单个 Offer 及其量化测算指标"""
    offer = session.get(Offer, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer 不存在")
    metrics = OfferCalculatorService.calculate_offer_metrics(offer)
    return {"offer": offer, "metrics": metrics}

@router.patch("/{offer_id}", response_model=Offer)
def update_offer(offer_id: int, offer_in: OfferUpdate, session: Session = Depends(get_session)):
    """更新 Offer 详情"""
    offer = session.get(Offer, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer 不存在")
    update_data = offer_in.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(offer, k, v)
    session.add(offer)
    session.commit()
    session.refresh(offer)
    return offer

@router.delete("/{offer_id}")
def delete_offer(offer_id: int, session: Session = Depends(get_session)):
    """删除 Offer 记录"""
    offer = session.get(Offer, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer 不存在")
    session.delete(offer)
    session.commit()
    return {"message": "Offer 已成功删除", "id": offer_id}
