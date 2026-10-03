// DOM Scraper for popular job platforms (Medical, Clinical, Tech & General)
function extractJobFromPage() {
  const url = window.location.href;
  const host = window.location.hostname;
  
  let job = {
    title: "",
    company: "",
    salary: "面议",
    location: "全国 / 远程",
    jd_text: "",
    source: "网页采集",
    source_url: url,
    tags: "自动采集"
  };

  // 1. 丁香人才网 / 丁香园 (jobmd.cn / dxy.cn) - 国内最大临床医药医疗招聘平台
  if (host.includes("jobmd.cn") || host.includes("dxy.cn")) {
    job.source = "丁香人才 (临床/医疗/医药)";
    job.title = document.querySelector(".job-name, .job-title, h1.title, .job_name, h1")?.innerText?.trim() || "";
    job.company = document.querySelector(".corp-name, .company-name, .enterprise-name, .hospital-name, .ent-name")?.innerText?.trim() || "";
    job.salary = document.querySelector(".job-salary, .salary, .pay")?.innerText?.trim() || "面议";
    job.location = document.querySelector(".job-city, .city, .address, .location")?.innerText?.trim() || "全国";
    job.jd_text = document.querySelector(".job-desc, .job-duty, .detail-desc, .job-detail, #jobDetail, .job-intro")?.innerText?.trim() || "";
    job.tags = "临床医疗,医药生化,医院直聘";
  }
  // 2. 高校人才网 / 医学与科研专区 (gaoxiaojob.com) - 全国医院、医科大学、科研院所
  else if (host.includes("gaoxiaojob.com")) {
    job.source = "高校人才网 (医疗科研/医院)";
    job.title = document.querySelector("h1.article-title, .announcement-title, h1")?.innerText?.trim() || "";
    job.company = document.querySelector(".source-unit, .author, .publisher")?.innerText?.trim() || "医院/科研院校";
    job.salary = "事业单位待遇 / 详见公告";
    job.jd_text = document.querySelector(".article-content, .announcement-content, .detail-content")?.innerText?.trim() || "";
    job.tags = "公立医院,临床科研,事业单位";
  }
  // 3. 医脉通 / 生物谷 (medlive.cn / bioon.com)
  else if (host.includes("medlive.cn") || host.includes("bioon.com")) {
    job.source = "医药生物专业平台";
    job.title = document.querySelector("h1, .job-name, .title")?.innerText?.trim() || "";
    job.company = document.querySelector(".company-name, .firm-name")?.innerText?.trim() || "药企/医疗机构";
    job.salary = document.querySelector(".salary")?.innerText?.trim() || "面议";
    job.jd_text = document.querySelector(".job-detail, .content, .description")?.innerText?.trim() || "";
    job.tags = "临床试验,医药研发,生物医药";
  }
  // 4. Boss直聘 (zhipin.com)
  else if (host.includes("zhipin.com")) {
    job.source = "Boss直聘";
    job.title = document.querySelector(".job-banner .name, .job-detail-box .name, h1.name")?.innerText?.trim() || "";
    job.company = document.querySelector(".company-info .name, .job-company .name, .company-name")?.innerText?.trim() || "";
    job.salary = document.querySelector(".job-banner .salary, .salary")?.innerText?.trim() || "面议";
    job.location = document.querySelector(".job-banner .text-city, .text-desc")?.innerText?.trim() || "待定";
    job.jd_text = document.querySelector(".job-sec-text, .job-detail-section")?.innerText?.trim() || "";
  }
  // 5. 猎聘网 (liepin.com)
  else if (host.includes("liepin.com")) {
    job.source = "猎聘";
    job.title = document.querySelector(".name-box .name, .job-title h1")?.innerText?.trim() || "";
    job.company = document.querySelector(".company-info-box .company-name, .company-title")?.innerText?.trim() || "";
    job.salary = document.querySelector(".name-box .salary, .salary")?.innerText?.trim() || "面议";
    job.location = document.querySelector(".job-properties span")?.innerText?.trim() || "待定";
    job.jd_text = document.querySelector(".job-intro-container, .job-item-content")?.innerText?.trim() || "";
  }
  // 6. 前程无忧 51Job (51job.com)
  else if (host.includes("51job.com")) {
    job.source = "前程无忧 51Job";
    job.title = document.querySelector(".cn h1, .bname h1, .tHeader h1")?.innerText?.trim() || "";
    job.company = document.querySelector(".cname a, .com_name, .company-name")?.innerText?.trim() || "";
    job.salary = document.querySelector(".cn strong, .sal, .salary")?.innerText?.trim() || "面议";
    job.location = document.querySelector(".lname, .city")?.innerText?.trim() || "全国";
    job.jd_text = document.querySelector(".job_msg, .bmsg.job_msg, .tBorderTop_box")?.innerText?.trim() || "";
  }
  // 7. 智联招聘 (zhaopin.com)
  else if (host.includes("zhaopin.com")) {
    job.source = "智联招聘";
    job.title = document.querySelector(".job-name, h1.title, .summary-plane__title")?.innerText?.trim() || "";
    job.company = document.querySelector(".company__title, .company-name")?.innerText?.trim() || "";
    job.salary = document.querySelector(".summary-plane__salary, .salary")?.innerText?.trim() || "面议";
    job.location = document.querySelector(".summary-plane__address, .city")?.innerText?.trim() || "全国";
    job.jd_text = document.querySelector(".describtion__detail-content, .job-detail-content")?.innerText?.trim() || "";
  }
  // 8. 牛客网 (nowcoder.com)
  else if (host.includes("nowcoder.com")) {
    job.source = "牛客网";
    job.title = document.querySelector(".job-title, .title-text")?.innerText?.trim() || "";
    job.company = document.querySelector(".company-name, .comp-name")?.innerText?.trim() || "";
    job.salary = document.querySelector(".job-salary, .salary-text")?.innerText?.trim() || "面议";
    job.jd_text = document.querySelector(".job-detail-content, .detail-content")?.innerText?.trim() || "";
  }
  // 9. V2EX (v2ex.com)
  else if (host.includes("v2ex.com")) {
    job.source = "V2EX 酷工作";
    job.title = document.querySelector(".header h1")?.innerText?.trim() || "";
    job.company = "V2EX 社区招聘";
    job.jd_text = document.querySelector(".topic_content")?.innerText?.trim() || "";
  }
  // 10. 通用网页智能兜底规则
  else {
    job.title = document.querySelector("h1, h2, title")?.innerText?.trim() || document.title;
    job.company = document.querySelector(".company, .employer, .brand, [class*='company'], [class*='hospital']")?.innerText?.trim() || "企业直聘";
    
    const mainEl = document.querySelector("main, article, .content, .job-description, #job-description, .post-content") || document.body;
    job.jd_text = mainEl ? mainEl.innerText.slice(0, 3500) : "";
  }

  // 兜底补齐
  if (!job.title) job.title = document.title || "未知职位";
  if (!job.company) job.company = "目标单位";

  return job;
}

// 供 popup.js 调用
extractJobFromPage();
