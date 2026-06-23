---
title: "BridgeDrive 将自动驾驶闭环规划建模为“从粗糙专家 anchor 到精细驾驶轨迹”的扩散桥生成过程"
author: ""
source_url: https://zhuanlan.zhihu.com/p/2036117878219527373
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# BridgeDrive 将自动驾驶闭环规划建模为“从粗糙专家 anchor 到精细驾驶轨迹”的扩散桥生成过程

> 作者:  | 来源: https://zhuanlan.zhihu.com/p/2036117878219527373

---

​
关注
收录于 · diffusion和flow相关自驾论文
7 人赞同了该文章
1. 这篇文章主要讲了什么？

这篇论文提出了 BridgeDrive，一个用于自动驾驶闭环轨迹规划的 anchor-guided diffusion bridge policy。核心目标是：在闭环自动驾驶场景中，生成既安全、可反应环境变化，又符合人类驾驶行为的未来轨迹。

它针对的主要问题是：已有扩散规划器，例如 DiffusionDrive，会用“anchor 轨迹”作为先验来引导生成，但它采用的是 truncated diffusion，即从加噪后的 anchor 开始反向去噪到真实轨迹。作者认为这会导致一个理论问题：前向扩散过程和反向去噪过程不对称。换句话说，训练时加噪的是 anchor，但反向过程却要恢复 ground-truth trajectory，这不像标准扩散模型那样真正“反转”前向过程。

BridgeDrive 的解决思路是：把自动驾驶轨迹规划形式化为一个 diffusion bridge 问题，即从一个粗糙的 anchor trajectory 出发，通过扩散桥逐步变换成一个精细的、上下文感知的规划轨迹。这样既保留了 anchor 的行为先验，又保证了扩散模型前向和反向过程的一致性。2. 使用了什么方法，具体是如何实现的？

BridgeDrive 的整体流程可以理解为三步：构造 anchor → 选择 anchor → 用 diffusion bridge refine 成最终轨迹。

2.1 Anchor 构造

论文使用一组预定义的 anchor trajectories 表示典型专家驾驶行为。这些 anchor 不是随机的，而是通过对训练集中专家轨迹进行 K-means 聚类得到的。和 DiffusionDrive 不同，BridgeDrive 输出的是 geometric path waypoints + speed，也就是等距离路径点加速度标量，而不是 temporal speed waypoints。作者认为 geometric waypoints 更适合表达路径形状，也更符合道路拓扑。

具体来说，每个 anchor 包含：

几何路径点：未来若干个等距离路径坐标；
速度：对应的 ego speed；
坐标全部归一化到 ego vehicle 坐标系下。
2.2 生成建模方式

作者把联合分布分解为：

其中：

z：驾驶场景信息，比如 BEV、目标点、传感器特征；
y：选择出来的 anchor；
x：最终规划轨迹。

这意味着规划分成两步：

第一步，根据场景 zzz 选择一个合适的 anchor yyy；
第二步，在 anchor 和场景信息的条件下，生成最终轨迹 xxx。

2.3 Diffusion Bridge

这是论文的核心。BridgeDrive 不再像普通 diffusion 那样从纯高斯噪声生成轨迹，也不像 DiffusionDrive 那样从加噪 anchor 做 truncated denoising，而是建立一个连接 ground-truth trajectory x0x_0x0​ 和 anchor xT=yx_T=yxT​=y 的桥：

直观理解：

t=T 时，轨迹接近 anchor；
t=0 时，轨迹变成 ground-truth；
中间过程是 anchor 和真实轨迹之间的连续过渡，并加入高斯噪声。

这样前向过程和反向去噪过程是对称的：训练时模型看到的是从真实轨迹到 anchor 的桥，推理时从 anchor 反向走到最终规划轨迹。

2.4 训练过程

训练时，每条 ground-truth trajectory 会找到最近的 anchor。然后模型采样一个扩散时间步 ttt，构造中间 noisy trajectory：

然后训练 denoiser xθ(xt,t,xT,z)x) 去预测原始真实轨迹 x0​。

同时，由于推理时没有 ground-truth trajectory，模型还训练了一个 anchor classifier hϕ​(z,Y)，用于根据场景信息从所有 anchors 中选择最合适的 anchor。

2.5 推理过程

推理时流程如下：

感知模块从 LiDAR、前视相机、目标点中提取 BEV 和融合特征；
anchor classifier 从所有 anchors 中选出最可能的 anchor；
以该 anchor 作为 xT，通过 PF-ODE solver 逐步反向求解；
denoiser 每一步预测 denoised mean trajectory；
最终得到规划轨迹 x0​。

论文图 2 展示了这个流程：anchor classifier 先选择 anchor，然后 denoiser 通过 Cross BEV Attention、Cross Feature Attention、FFN、Time Modulation 和 MLP 逐步输出 denoised trajectory。

3. 实验结果如何？

实验主要在 Bench2Drive closed-loop benchmark 上进行。作者强调闭环评估更重要，因为 ego vehicle 的动作会影响后续环境状态，能够更真实地反映规划器能力。Bench2Drive 包含 220 条 CARLA Leaderboard 2.0 路线，每条约 150 米，并覆盖不同驾驶场景。

3.1 Bench2Drive 主结果

BridgeDrive 在 PDM-Lite 数据集上取得：




方法	Driving Score	Success Rate
SimLingo	85.07	67.27%
TransFuser++	84.21	67.27%
DiffusionDrivegeo	80.79	58.18%
BridgeDrive	87.99	74.99%




也就是说，BridgeDrive 相比之前 SOTA SimLingo：

Driving Score 提升 +2.92；
Success Rate 提升 +7.72%。
3.2 LEAD 数据集结果

在 LEAD 数据集上，BridgeDrive 也超过了 LEAD baseline：




方法	Driving Score	Success Rate
TFv6	95.2	86.8%
BridgeDrive	96.34	89.25%




这说明它不仅在 PDM-Lite 上有效，也能迁移到不同专家数据集。

3.3 NAVSIM 开环结果

在 NAVSIM 上，BridgeDrive 的 PDMS 为 88.0，基本接近 DiffusionDrive reported 的 88.1。作者也说明 NAVSIM 是 open-loop、non-reactive agents 的评估方式，不能充分体现长时闭环交互误差，因此论文重点还是放在 Bench2Drive 闭环评估上。

3.4 消融实验结果

论文做了几类关键 ablation。

第一，geometric waypoints 明显优于 temporal waypoints。在 DiffusionDrive、Full Diffusion、BridgeDrive 三种模型中，把 temporal representation 换成 geometric representation 后，Success Rate 分别提升了 +5.46%、+4.09%、+15.09%。

第二，anchor guidance 很重要。Full Diffusion 虽然有多模态生成能力，但没有 anchor 时，在一些需要及时变道、跟随目标点的场景中容易错过时机。BridgeDrive 通过 anchor 提供强行为先验，可以更早、更稳定地执行正确 maneuver。

第三，diffusion bridge refinement 也很重要。仅靠 anchor classification 不足以生成高质量轨迹；anchor-based regression 也不如 BridgeDrive，说明迭代式概率 refinement 对性能有实质贡献。

第四，anchor 数量存在最优点。论文发现 60 个 anchors 最好，太少会限制行为多样性，太多会降低分类准确率。

4. 核心创新点有哪些？

我认为这篇文章的核心创新主要有 4 个。

4.1 用 diffusion bridge 替代 truncated diffusion

这是最关键的创新。DiffusionDrive 从 noisy anchor 去预测 ground-truth，但其 forward process 和 reverse process 并不严格匹配。BridgeDrive 直接定义从 ground-truth 到 anchor 的 bridge diffusion，再从 anchor 反向求解到轨迹，使模型更符合扩散模型的理论框架。

这不是简单“换个采样方式”，而是重新定义了 anchor-guided diffusion planning 的生成范式。

4.2 把 anchor 作为 bridge endpoint，而不是仅作为 noisy initialization

在 DiffusionDrive 中，anchor 更像是采样起点或初始先验；在 BridgeDrive 中，anchor 被正式建模为扩散桥的终点 xT。因此 anchor 不只是启发式初始化，而是概率生成过程中的条件端点。

这使得 anchor guidance 和 diffusion generation 结合得更自然。

4.3 几何路径点 + 速度的轨迹表示

论文没有沿用 DiffusionDrive 的 temporal speed waypoints，而是采用 geometric path waypoints 加 speed。作者认为 temporal waypoints 把速度信息隐式编码在相邻点间距中，容易造成泛化困难；geometric waypoints 更直接描述路径形状，速度单独预测，因此更适合 overtaking、lane following 等闭环场景。

4.4 闭环评估下的高性能验证

论文不是只在 open-loop 轨迹误差上做实验，而是重点评估 Bench2Drive 这种 closed-loop benchmark。BridgeDrive 在 Success Rate 上相较 prior SOTA 有明显提升，这强化了它对真实交互式规划任务的意义。

5. 这一系列工作未来可能产生什么影响？

这篇文章的影响主要在于：它给 扩散模型做自动驾驶规划 提供了一个更合理的 anchor-guided 形式。

以前自动驾驶扩散规划大致有两类：

一类是从高斯噪声生成轨迹，优点是多模态强，但缺点是搜索空间太大，推理和稳定性都可能有问题；
另一类是像 DiffusionDrive 那样用 anchor 缩小搜索空间，但可能会引入扩散过程不一致的问题。

BridgeDrive 给出的是第三种路线：以 anchor 作为行为先验，用 diffusion bridge 做从粗到细的轨迹 refinement。这可能会影响后续工作从以下几个方向发展：

第一，更多 planner 会把“专家先验”显式放进生成过程，而不是仅作为初始化或后处理。
第二，闭环规划可能更重视理论一致的生成建模，而不是只追求经验性能。
第三，diffusion bridge / flow matching / rectified flow 这类“端点条件生成”方法，可能会成为轨迹规划中的常用范式。
第四，anchor-guided generative planning 可能和 VLA、LLM-based reasoning、RL post-training 结合，形成“语言理解 + 行为先验 + 生成式规划 + 闭环优化”的自动驾驶框架。论文自己也提到，未来可以将 VLA 先验引入 BridgeDrive。

6. 缺点是什么，可以如何改进？
6.1 对 anchor classifier 依赖较强

BridgeDrive 推理时先选 anchor，再进行 diffusion bridge refinement。如果 anchor 选错，后续生成会被错误先验牵引。论文图 1 中也展示了 catastrophically wrong anchor 会导致失败案例。消融实验也显示，从 best anchor 换到第 2、第 3、第 4 个 anchor 后，Success Rate 会从 74.99% 降到 69.09%、61.36%、57.72%。

改进方向：

可以不用单一 anchor，而是保留 top-k anchors 并行生成多条候选轨迹，再用 learned scorer、rule-based safety checker 或 cost function 选择最终轨迹。这样可以降低单次分类错误带来的风险。

6.2 舒适性和 Give Way 指标不够好

论文明确提到 BridgeDrive 在 Comfortness 和 Give Way 上表现不够理想，可能说明模型更偏向安全，存在频繁或时机不佳的刹车行为。

改进方向：

可以在训练目标中加入 comfort-aware loss，例如 jerk、acceleration smoothness、brake timing penalty；也可以在后处理阶段使用 trajectory smoothing 或 MPC-style refinement，使生成轨迹更平滑。

6.3 OOD 场景泛化仍然有限

论文在 Appendix B.3 中指出，BridgeDrive 对训练集中很少出现的 out-of-distribution 场景仍然处理不好。例如在对向车辆存在时，超车动作应该被中止，但训练数据中这类“错误时机下的超车修正”很少，因为专家 policy 使用 privileged information，通常只会在理想时机超车。

改进方向：

可以通过三种方式增强 OOD 鲁棒性：

用更多 corner cases 数据增强训练集；
引入 VLA 或场景理解模型，提供更高级的语义判断；
用 reinforcement learning 或 closed-loop imitation 进行 post-training，让模型在失败恢复场景中学习。
6.4 推理速度还有进一步优化空间

BridgeDrive 已经能实时运行，但它仍然需要多步 ODE solver。论文中 BridgeDrive 使用 20 个 diffusion timesteps，单帧推理约 0.10 秒，而 DiffusionDrive 是 2 步、约 0.05 秒。

改进方向：

可以做 one-step diffusion distillation，把多步 diffusion bridge 压缩成一步 planner。论文结论中也提到可以借鉴 one-step diffusion distillation 来进一步加速。

6.5 速度控制仍可能是薄弱点

虽然 geometric waypoints 对路径形状有优势，但速度单独预测或控制仍可能带来问题。论文 qualitative case 中也提到 temporal representation 在 overtaking 中可能出现协调和速度控制不足，而 geometric representation 更好。不过 geometric path + scalar speed 是否是最优表达，论文也承认还没有完全解决。

改进方向：

可以考虑联合建模 temporal waypoints、geometric path 和 control commands，让模型同时学习路径、速度和控制之间的对应关系，而不是只依赖单一表示。

总结评价

这篇文章的价值不只是“又做了一个扩散规划器”，而是把 anchor-guided diffusion planning 从经验技巧推进到更理论一致的形式。它的关键贡献是用 diffusion bridge 把粗糙 anchor 和最终规划轨迹连接起来，从而避免 DiffusionDrive 中 truncated diffusion 的前后过程不匹配问题。

从实验看，BridgeDrive 在 Bench2Drive 上确实显著提升了 Success Rate，说明这种建模方式对闭环规划是有效的。但它仍然有几个现实问题：anchor 选择错误会影响规划、OOD 场景泛化有限、舒适性不足、速度控制和推理效率仍有优化空间。总体来看，它是一篇很适合写进“扩散模型用于自动驾驶规划”相关工作的论

所属专栏 · 2026-05-08 16:21 更新
diffusion和flow相关自驾论文
老宁头不开车
5 篇内容 · 22 赞同
订阅
最热内容 ·
Unleashing the Potential of Diffusion Models for End-to-End Autonomous Driving论文笔记
编辑于 2026-05-08 16:21・辽宁
手机稳定器要不要买？2026手机稳定器良心推荐不交智商税！如何选出一款高价值的稳定器？浩瀚/大疆/智云哪个牌子好？
开篇先抛3个问题，再决定你要不要入手一台手机稳定器。 [图片] 什么是手机稳定器？也叫手机云台，简单来说，就是自拍...
怕我你爱了吗
100+种草
​
赞同 7​
​
添加评论
​
25
​
喜欢
​
分享
​
申请转载
​
​


## 图片

![图片](https://pic1.zhimg.com/v2-26497e996977fb2213f794b40a3c8f11_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pica.zhimg.com/v2-4812630bc27d642f7cafcd6cdeca3d7a.jpg?source=88ceefae)

![图片](https://picx.zhimg.com/v2-ca108440fe35ee928838887d38cee607_1440w.jpg)

![图片](https://picx.zhimg.com/v2-1f29076030ef2b39bad0ee3512e256f1_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-4cd6993787b41539c972682140316983_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-da6e5e1ab18b9299d971ad74175f6048_720w.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-26497e996977fb2213f794b40a3c8f11_l.jpg?source=172ae18b)

![图片](https://pic4.zhimg.com/v2-6090bdca6cf2b423dd1b87b1eab93a57.webp)

