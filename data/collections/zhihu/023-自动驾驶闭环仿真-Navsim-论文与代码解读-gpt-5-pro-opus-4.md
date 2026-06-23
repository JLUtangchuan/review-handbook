---
title: "自动驾驶闭环仿真 Navsim：论文与代码解读（gpt-5-pro + opus-4）"
author: "周舒畅"
source_url: https://zhuanlan.zhihu.com/p/1965445881814843443
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 自动驾驶闭环仿真 Navsim：论文与代码解读（gpt-5-pro + opus-4）

> 作者: 周舒畅 | 来源: https://zhuanlan.zhihu.com/p/1965445881814843443

---

完整见：论文与代码解读 html

或 https://github.com/zsc/navsim_doc/blob/main/paper.md

https://arxiv.org/abs/2406.15349

下面这篇论文就是你现在这套 NAVSIM 代码所实现/承载的方法论本身（他们在文中也把代码指向 autonomousvision/navsim）。我按“论文在讲什么 → 和你现有代码一一对齐 → 怎么落地/复现 → 常见坑”来细说，并把关键段落用出处标注好。

一、TL;DR（一句话版）

Pseudo‑Simulation（伪仿真） 用真实日志做开环评估，但预先为每个真实观测生成一组“潜在未来”合成视角（3D Gaussian Splatting 渲染），然后用两阶段评分并按“与阶段一终点的接近度”给阶段二打高斯权重聚合，做到既像闭环那样考察误差累积/恢复，又保持开环的可并行、高效率；与 nuPlan 闭环分数相关性 R²≈0.8，优于最佳开环法 R²≈0.7，交互调用次数约少 6×。这项工作收录 CoRL 2025，并发布了公开榜单。

二、论文方法要点（和你现有概念快速对齐）
两阶段评估协议

Stage‑1：对真实观测（真实多相机+自车状态+离散驾驶指令左/直/右）推理 4s 轨迹；用 车辆动力学（Kinematic Bicycle）+ LQR 以 10 Hz 执行，交通车体是可反应的（基于 IDM 规则），得到阶段一分数与终点。这一步本质是“开环仿真+反应式背景交通”。
Stage‑2：在预生成的多组合成视角（同一场景、不同起点/朝向/速度）重复上述评分；最后按这些合成起点与 Stage‑1 终点的空间接近度做高斯加权聚合，强调更可能发生的未来。

合成视角如何来

以专家 4s 终点为中心：横向每 0.5 m、至两侧各 2.0 m；纵向每 5.0 m，覆盖从最短刹停距离到 4 s、4.0 m/s² 可达的最远距离（高速场景会生成更多视角）。给每个起点匹配相近的人类运动史（限速差/加速度差/航向差），再对乘法指标（NC/DAC/DDC/TLC）做拒绝采样，确保都是“可评”的候选。

视角渲染：使用针对驾驶场景改造的 MTGS（Multi‑Traversal Gaussian Splatting） 动态重建+渲染，配套 LiDAR 配准 + BA + 位姿优化 提升精度；还对视觉质量做了半自动过滤。

指标：EPDMS（扩展 PDM 分数）

乘法指标（任一 0 则总分 0）：NC / DAC / DDC / TLC。
NC（No At-fault Collision）：不发生“由自车负责”的碰撞（比如追尾、强行并线撞到别人等）。
DAC（Drivable Area Compliance）：始终在可行驶区域内行驶，不压人行道、路肩、绿化带等。
DDC（Driving Direction Compliance）：遵守道路规定的行驶方向，不逆行、不占用反向车道。
TLC（Traffic Light Compliance）：遵守红绿灯，不闯红灯、不在红灯越过停止线进入路口。
加权指标（加权平均）：EP、TTC、LK、HC、EC（权重依次 5/5/2/2/2）。
EP（Ego Progress）：衡量自车沿目标路线/车道中心线推进了多少（归一化到 0–1）。推进越多，得分越高。
TTC（Time-to-Collision）：最近一次可能碰撞的预计时间是否安全；在 NAVSIM 中，最小 TTC 若大于阈值（≈0.9s）记为 1，否则为 0。
LK（Lane Keeping）：车道保持能力；看车辆是否稳定地待在目标车道/靠近车道中心，长时间偏离中心线会被判为失败。
HC（History Comfort）：历史舒适度；在评分时把预测轨迹前面接上一小段“历史行驶”，检查衔接是否平滑，避免突然的加速/刹车/转向。
EC（Extended Comfort）：扩展舒适度；检查相邻时刻的运动是否连续平滑，抑制抖动和忽快忽慢，鼓励时间上一致的驾驶。
引入人类惩罚过滤：若人类在同场景也违规（如为绕障暂入对向），则不惩罚Agent，避免把合理的情境性操作算作错误。
这些维度、权重与你项目文档里的一致；你代码里的 PDMScorerConfig 就是它的工程体（含 human_penalty_filter）。
对齐闭环、效率与榜单
对 83 个规划器（规则+学习）做对齐分析：伪仿真与 nuPlan 闭环分数相关好，尤其是学法；在相同场景下，伪仿真平均每个场景13 次推理，nuPlan 闭环需要 80 次（8s@10Hz），6× 更省交互；即便把 Stage‑2 视角稀疏到 25%，相关性仍 >0.85。
发布 navhard 子集的公开榜单（Stage‑1=450、Stage‑2=5462），用来揭示以往看不到的失败模式（例如特权 PDM‑Closed 舒适度项相对较弱）。
代价与限制：视角预渲染按场景 1–2 小时 级别，适合千级规模，超大规模还需更快的神经表示；目前对真实车路实测的直接相关尚未给出，需要进一步验证。
三、和你现有 NAVSIM 代码“一一对齐”
你上传的文档覆盖了 Agent 抽象、场景加载两阶段、PDM 评分与仿真、以及评估脚本与整体架构。下面逐点映射。

1) Agent 接口（论文中的“AV/Planner”） → AbstractAgent

论文里 AV 在两个阶段都要输出 4s 轨迹（10 Hz），这与你的 AbstractAgent.compute_trajectory() 完全一致；传感器需求/历史帧由 get_sensor_config() 定义。
端到端学习 Agent（如 LTF/TransFuser）通过 forward() + 特征构建器走推理；非学习基线（CV/MLP）也遵循相同接口。

2) 两阶段数据与加载 → SceneLoader

论文 Stage‑1/Stage‑2 的任务切分，对应你 Loader 里原始场景 tokens_stage_one 与合成场景 tokens_stage_two；filter_synthetic_scenes() 正是筛选 Stage‑2 候选的通道。
get_agent_input_from_token() 给 Agent 准备多相机/点云/自车状态/地图/路线等输入，正好对应论文任务输入。

3) BEV 仿真+反应式交通 → PDMSimulator + IDM

论文 Stage‑1/2 都是不回馈闭环地执行 4s 轨迹，但带可反应交通（IDM）；你栈里对应 PDMSimulator（含自行车模型+LQR）与批量 IDM。

4) 指标与评分器 → PDMScorer（EPDMS）

乘法/加权两块、各子指标的权重/阈值、及人类惩罚过滤在你的 PDMScorerConfig / score_proposals() 里都现成可配。

5) 两阶段聚合 → 评估脚本 run_pdm_score.py

论文说 Stage‑1 与 Stage‑2 的乘法聚合 + 高斯加权；你项目 TOP10 文档里，这部分由评估主入口脚本完成（第一/二阶段评分与聚合逻辑集中在该脚本）。
你的“系统架构与调用关系图”也明确画出了两阶段评估主流程与组件交互（Agent → 仿真/评分 → 聚合）。

6) 论文“NavHard 榜单/整体框架” → 你的“项目功能总结/核心概念”

文档里“伪仿真、EPDMS、两阶段、6×提速”的总体定位，与论文摘要/结论一致。
四、落地与复现：工程步骤清单（按你代码组织）
下面是“最小改动即可跑通”的路线。变量命名按你当前模块来写。
A. 准备与预渲染（一次性离线）
选定评估子集（建议先用论文的 navhard 子集规模思路），用 SceneLoader.filter_scenes() 得到 Stage‑1 tokens。
按论文采样规则生成 Stage‑2 起点（横 0.5 m 到 ±2 m；纵 5 m 采样、受 4 s@4.0 m/s² 约束），并执行人类轨迹匹配与拒绝采样（违反 NC/DAC/DDC/TLC 的起点剔除）。
对保留下来的候选位姿，跑 MTGS 动态重建并渲染多相机视角；把结果放到 synthetic_scenes_path，让 SceneLoader.filter_synthetic_scenes() 能索引到。
论文注：该步骤每场景约 1–2 小时，是主要离线成本。
B. 阶段一/二评估主流程
实例化 Agent（学习/非学习均可）；get_sensor_config() 只开必要模态以控算力。
Stage‑1：

get_agent_input_from_token() → agent.compute_trajectory() → PDMSimulator.simulate()（Kinematic Bicycle + LQR、IDM 开启）→ PDMScorer.score_proposals()（开启 human_penalty_filter）。

Stage‑2：

遍历 tokens_stage_two 的合场景，重复上一步评分流程拿到一组分数。

聚合：

用高斯权重对 Stage‑2 分数加权（权重取决于“Stage‑2 起点 ↔ Stage‑1 终点”的距离），再与 Stage‑1 分数做乘法聚合。


参考实现伪码（放到你的评估脚本聚合处）：

# s1: Stage-1 分数；s2: [N] Stage-2 分数数组
# p2: [N,2] Stage-2 起点坐标；p1: [2] Stage-1 终点；sigma: 高斯核方差
w = np.exp(-np.sum((p2 - p1)**2, axis=1) / (2 * sigma**2))
w = w / (w.sum() + 1e-8)
final_score = s1 * np.dot(w, s2)  # 论文默认：跨阶段用乘法，Stage-2 用高斯加权平均
你的 TOP10 文档指出聚合逻辑在评估入口脚本中实现，这里正是对应的落点。
五、结果怎么看（与论文一致的“验收标准”）
对齐性：伪仿真分数与 nuPlan 闭环分数的点云图应表现出高线性/秩相关（论文示例用 83 个规划器做了相关分析）。
效率：每个场景 Agent 推理次数 ≈ 1（Stage‑1） + ~12（Stage‑2 平均）≈ 13；而 8 s 闭环要 80 次（10 Hz），你应能观测到~6× 交互节省。
稳健性揭示：Stage‑2 普遍比分数下降（对分布偏移更敏感），能暴露以往榜单难以捕捉的失败模式（如舒适度）。
六、常见坑与工程建议
IDM 反应式交通要开：否则你测到的是“非反应式回放”，和论文设定不一致（现实感退化）。你的仿真栈已包含 IDM 策略与批量接口。
人类惩罚过滤要配：PDMScorerConfig.human_penalty_filter=True，并确保传入 human_past_trajectory；否则会把“合理避障”当违规。
合成视角质量门控：渲染前后都要做质量过滤（论文做了水滴/眩光等异常筛除与 LPIPS 评估）；低质视角会误伤 LK/TTC 等分数。
权重核宽度（σ）：σ 太大 → 稀释最可能未来；太小 → 过拟合单一视角。论文对不同方差做了对比，默认较小方差表现更好。
缓存/并行：合成视角数量可观，务必结合你现有的指标缓存、批处理与 Ray 并行来控时。
七、和你代码的“名词到实现”对照速查
Pseudo‑Simulation（两阶段 + 合成视角 + 加权聚合） → run_pdm_score.py 评估主流程 + SceneLoader 两阶段 token + 评分聚合实现。
EPDMS 指标 → PDMScorer.score_proposals() + PDMScorerConfig 权重阈值；含人类惩罚过滤。
仿真执行 → PDMSimulator（Kinematic Bicycle + LQR）+ IDM 交通。
Agent/Planner → AbstractAgent（传感器配置、前向/轨迹输出接口），兼容 CV/MLP/LTF/Transfuser 等。
系统图与调用关系 → 你的“主要模块和调用关系图”。
八、论文关键信息（便于查阅原文）
版本与会议：v2（2025‑08‑27），CoRL 2025；摘要与方法框、R²、效率、代码链接等见论文首页与摘要。
采样与渲染细节：Stage‑2 起点网格、历史匹配与拒绝采样规则，MTGS 渲染与位姿优化等。
对齐分析与效率：83 个规划器相关性、13 vs 80 次推理、密度消融等。
NavHard 榜单：450（S1）/5462（S2）与子分项对比。
限制：预处理 1–2 小时/场景、与实际道路部署的相关性待验证。


## 图片

![图片](https://pic1.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-0ecd74b1b34fd63a2126d469cfec0414_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-27bfcba90e66db79ce8768ab807e017e_l.png?source=32738c0c)

![图片](https://pic4.zhimg.com/v2-c75b4a3c23cbb0982d29e68ca922e79d_1440w.jpg)

![图片](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-0ecd74b1b34fd63a2126d469cfec0414_l.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-27bfcba90e66db79ce8768ab807e017e_l.png?source=32738c0c)

![图片](https://pic4.zhimg.com/v2-1f4740e0798e0fc5eac8c4cc7dae9fc2.webp)

![图片](https://pic1.zhimg.com/v2-0598184fdb5ebd0705d1a7614a438352_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-0ecd74b1b34fd63a2126d469cfec0414_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-d682d7e08ec3b7610e8dc630710766b1_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-384d886cc28f00f1dfb49daa14247169_250x0.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-fc2098f92ddb1370fc01e266846e61b1_250x0.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-310cb749b475b1292d00a2b523551221_250x0.jpg?source=172ae18b)

