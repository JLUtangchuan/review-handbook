---
title: "具身智能为什么要用Diffusion Policy及其优化"
author: "肖畅"
source_url: https://zhuanlan.zhihu.com/p/1934570701471331551
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 具身智能为什么要用Diffusion Policy及其优化

> 作者: 肖畅 | 来源: https://zhuanlan.zhihu.com/p/1934570701471331551

---

一、动作生成为什么要用diffusion Policy
效果好！
Diffusion Policy 直接对多样化的动作模式建模。在多个仿真环境（如 Robomimic、Franka Kitchen）和 UR5 真机任务中，相比现有最先进方法取得了平均 46.9% 的性能提升，同时实现了超过 100Hz 的控制频率。
技术适配！
传统行为克隆（BC）的局限性​： 监督学习拟合动作分布，直接回归多个样本值的“平均值”，如抓取任务中同时使用左右手的平均值反而无法抓取物体。
更直白的解释：在训练数据中，一个语言的指令（“拿起毛巾”）对应着多个实际的机器人动作（单臂、多臂的多种实现“拿起毛巾”的动作序列）。模型每次都会训练拟合到某个动作序列中。
diffusion的核心优势：支持 同一个文本对应多个图片的生成的范式，天然适应一个语言指令对应多个动作的场景。
二、Diffusion Policy的基本特点
diffusion vs. GAN/VAE
GAN:
生成特点：易模态崩溃（Mode Collapse），生成动作单一
​训练特点:难收敛
​VAE​:
生成特点：重建模糊（Blurry Reconstruction），动作精度低
训练特点:变分下界优化稳定但性能受限
diffusion
生成特点：渐进去噪保留细节，适合关节角度等高维连续信号。
训练特点:训练目标为均方误差，稳定性高；条件注入方式包括Concat和Cross-Att，以及融合；详见：https://zhuanlan.zhihu.com/p/2621118350
推理加速方案
​采样优化https://zhuanlan.zhihu.com/p/686200955​:将扩散过程视为确定性ODE，减少迭代步数（100步→10-20步）
​渐进式蒸馏​:训练轻量学生模型模拟教师模型
​动作分帧执行​:一次生成多步动作序列，仅执行前 k 步后重新规划
物理约束与策略探索
关节速度限制：
将生成动作投影到物理约束流形（其实就是裁剪）：torch.clamp(a_pred, -0.5, 0.5)；
投影梯度下降：a_pred*0.9+torch.clamp(a_pred, -0.5, 0.5)*0.1
引入熵正则化（提高动作的探索性）：损失函数加入熵项：\mathcal{L} = \mathbb{E}[ \| a - \pi(s) \|^2 ] - \alpha H(\pi(\cdot|s))
三、优化方向
​动力学约束​：（DDAT）：流形投影机制，将轨迹投影至机器人动力学可达集，凸多面体近似可达集优化投影效率）将物理约束嵌入生成过程。
三维感知（DP3/iDP3）：以点云编码替代2D图像。
​延迟优化（ManiCM​）：一致性蒸馏，提速到一步生成。
​多模态协同（ScaleDP）：多模态独立编码，最后统一到一个输入范式。


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pica.zhimg.com/v2-6cd28b8e600743e7c11020e9c50f6201_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-968a13c6f42266998780a424416383d3.webp?source=7e7ef6e2&needBackground=1)

![图片](https://pic4.zhimg.com/v2-f61f746b4afa6be578e862169f2ef83d.webp)

![图片](https://pic1.zhimg.com/11427fe9a0c525a31d1e9f9276da22ae_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-e27a9d07159b12d4fdc1aad2e97e4b9d_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-61f3723a9b96053781f709976cb12e45_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-9c67055594fa34588d836045d9b60ff3_250x0.jpg?source=172ae18b)

![图片](https://pica.zhimg.com/v2-80253aaa0b55dbadd47fedadabbf498d_250x0.jpg?source=172ae18b)

