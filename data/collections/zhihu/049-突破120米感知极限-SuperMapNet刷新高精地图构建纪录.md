---
title: "突破120米感知极限！SuperMapNet刷新高精地图构建纪录"
author: "深蓝学院"
source_url: https://zhuanlan.zhihu.com/p/1914325169041839658
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 突破120米感知极限！SuperMapNet刷新高精地图构建纪录

> 作者: 深蓝学院 | 来源: https://zhuanlan.zhihu.com/p/1914325169041839658

---

论文标题：SuperMapNet for Long-Range and High-Accuracy Vectorized HD Map Construction
论文作者：Ruqin Zhou, San Jiang, Wanshou Jiang, Yongsheng Zhang, Chenguang Dai
论文链接：https://arxiv.org/pdf/2505.13856
导语
SuperMapNet 是一款革命性的端到端（E2E）框架，专为长距离、高精度矢量化高精度地图（HD Map）构建而设计。它通过创新的语义-几何耦合（SGC）和点-元素耦合（PEC）模块，巧妙融合相机图像与 LiDAR 点云的多模态数据，实现 120 米超远感知范围和卓越的构建精度。在 nuScenes 和 Argoverse2 数据集上，SuperMapNet 刷新了性能纪录，为自动驾驶提供了高效、可靠的地图解决方案。
1. 研究背景
高精度地图（HD Map）是自动驾驶（AD）系统的基石，为路径规划、车辆定位和驾驶决策提供不可或缺的环境信息。传统 HD 地图构建方法主要分为两类：栅格化方法（如 HDMapNet）生成像素化地图，存储成本高且后处理复杂；矢量化方法（如 VectorMapNet）通过关键点序列表示地图，存储效率更高，但在长距离感知和复杂场景下的元素纠缠问题上表现欠佳。例如，MapTR 等矢量化方法虽支持高效构建，但受限于 60 米感知范围和精度不足。现有方法在融合多模态数据（如相机图像和 LiDAR 点云）时也存在局限，导致难以满足高速驾驶或复杂城市环境的需求。







图 1：栅格化和矢量化高清地图的可视化比较。




图 2：SuperMapNet的整体架构。通过基于交叉注意力的协同增强模块和基于流的差异对齐模块紧密耦合相机图像的语义信息和激光雷达点云的几何信息，用于长距离鸟瞰图特征生成，以及通过点到点、元素到元素和点到元素三个层面的交互紧密耦合局部和全局建模信息以及几何和语义建模信息，用于地图元素的高精
图 3：根据用于生成鸟瞰图特征的不同模态，基于深度学习的高清地图构建方法的演变。现有方法分为三种类型：相机-激光雷达融合、相机-标准定义地图融合和相机-时间融合方法。
2. 技术贡献

为了解决现有高精地图在线构建方法的局限性，SuperMapNet 创新性地融合了相机图像和激光雷达点云这两种模态的数据，通过独特的语义 - 几何耦合（Semantic-Geometric Coupling，简称 SGC）模块和点 - 元素耦合（Point-Element Coupling，简称 PEC）模块，充分利用了不同模态数据的优势，同时克服了单一模态感知能力有限以及多模态直接拼接导致的问题。

1. 语义-几何耦合（SGC）模块：通过协同增强和差异对齐机制，融合相机图像的语义信息与 LiDAR 点云的几何信息，生成高质量 BEV 特征，支持 120 米感知范围。

2. 点-元素耦合（PEC）模块：引入三级交互机制（Point2Point、Element2Element、Point2Element），精准捕捉点与元素间的局部和全局关系，有效减少元素纠缠并提升分类与定位精度。

3. 模型细节

SuperMapNet融合相机图像和LiDAR点云，通过SGC模块生成长距离BEV特征，通过PEC模块实现高精度地图元素分类和定位，克服了单一模态感知局限和多模态直接拼接的不足。

3.1. 语义-几何耦合（SGC）模块

SGC模块融合相机图像的语义信息和LiDAR点云的几何信息，生成高质量、长距离的BEV特征。其流程如下：

输入处理

相机图像：使用 Swin Transformer 编码多视图图像特征，通过可变形 Transformer 结合相机几何先验转换为鸟瞰图空间特征B_{\text{cam}} \in \mathbb{R}^{C \times H \times W}。

激光雷达点云：通过下采样和 PointPillars 动态体素化，生成鸟瞰图特征B_{\text{lidar}} \in \mathbb{R}^{C \times H \times W} 。

协同增强（Synergy Enhancement）

通过交叉注意力机制挖掘相机和激光雷达特征的互补性。对于任一模态的鸟瞰图特征 （\text{mod} = \text{cam} 或 \text{lidar}），使用三个MLP生成查询、键和值：Q_{\text{mod}} = \text{MLP}(B_{\text{mod}}), \quad K_{\text{mod}} = \text{MLP}(B_{\text{mod}}), \quad V_{\text{mod}} = \text{MLP}(B_{\text{mod}})

计算交叉注意力矩阵：A_{\text{cam2lidar}} = \text{softmax}\left(\frac{Q_{\text{cam}} K_{\text{lidar}}^T}{\sqrt{d_k}}\right), \quad A_{\text{lidar2cam}} = \text{softmax}\left(\frac{Q_{\text{lidar}} K_{\text{cam}}^T}{\sqrt{d_k}}\right)

其中d_k为缩放因子。

生成互补信息：C_{\text{cam}} = A_{\text{cam2lidar}} V_{\text{lidar}}, \quad C_{\text{lidar}} = A_{\text{lidar2cam}} V_{\text{cam}}

融合原始值和互补信息，通过卷积生成精炼特征：B_{\text{mod}} = \text{conv}(\text{concat}(V_{\text{mod}}, C_{\text{mod}}))

此过程填补激光雷达远距离特征空洞，增强相机特征的几何精度。

差异对齐（Disparity Alignment）：

针对传感器定位误差导致的特征不对齐，基于流的方法校准相机鸟瞰图特征。融合精炼特征B_{\text{cam}}和B_{\text{lidar}}，通过卷积生成位移流：(\Delta_h, \Delta_w) = \text{conv}(\text{concat}(B_{\text{cam}}, B_{\text{lidar}}))

校准相机特征坐标，使用双线性插值核重采样： \text{weight}_{h'} = \max(0, 1 - |h + \Delta_h - h|),\quad \text{weight}_{w'} = \max(0, 1 - |w + \Delta_w - w|)

B'_{\text{cam}}(h,w) = \sum_{h'=1}^H \sum_{w'=1}^W B_{\text{cam}}(h',w') \cdot \text{weight}_h' \cdot \text{weight}_w'

最终融合校准后的B'_{\text{cam}}和B_{\text{lidar}}，生成融合鸟瞰图特征B \in \mathbb{R}^{C \times H \times W}。




图 4：语义和几何耦合（SGC）模块。协同增强旨在挖掘相机鸟瞰图特征和激光雷达鸟瞰图特征间的关系和互补性，差异对齐旨在在拼接前减少两个传感器间的坐标误差。

3.2. 点-元素耦合（PEC）模块




PEC 模块通过三级交互（Point2Point、Element2Element、Point2Element）耦合点查询和元素查询的局部与全局特征，实现高精度地图元素分类和定位。地图元素以有序关键点集表示，输入为融合鸟瞰图特征B、点查询\{Q_{m,n}\}_{n=1}^N和元素查询\{Q_m\}_{m=1}^M。

Point2Point 交互：

学习同一元素内点间的几何关系和每个点的局部信息。输入点查询\{Q_{m,n}\}_{n=1}^N \in \mathbb{R}^{2 \times N}，输出点描述符\{D_{m,n}\}_{n=1}^N \in \mathbb{R}^{C \times N}。 在第l层，拼接点描述符生成元素感知特征：F_{\text{element-aware}}^l = \text{MLP}(\text{concat}(D_{m,1}, D_{m,2}, \ldots, D_{m,N}))

计算点掩码： M_{\text{point}}^l = \sum_{c=1}^C F_{\text{element-aware}}^l(c) \cdot B(c,:,:)

通过跨注意力更新外部点信息，自注意力学习内部点信息，最终通过 FFN 生成点描述符\{D_{m,n}^l\}_{n=1}^N。

Element2Element 交互：

学习元素间的语义关系和全局形状信息\{Q_m\}_{m=1}^M。输入元素查询，输出元素描述符\{D_m\}_{m=1}^M。

在第l层，生成全局感知特征： F_{\text{global-aware}}^l = \text{MLP}(\text{concat}(D_1, D_2, \ldots, D_M))

计算元素掩码： M_{\text{element}}^l = \sum_{c=1}^C F_{\text{global-aware}}^l(c) \cdot B(c,:,:)

通过跨注意力、自注意力和 FFN 生成元素描述符\{D_m^l\}_{m=1}^M。

Point2Element 交互：

实现元素与点之间的信息互补。输入元素描述符D_m和点描述符\{D_{m,n}\}_{n=1}^N，更新两者：Q_{m,i}^l = \text{MLP}(D_{m,i}^l), \quad K_{m,i}^l = \text{MLP}(D_{m,i}^l)

Q_m^l = \text{MLP}(D_m^l), \quad K_m^l = \text{MLP}(D_m^l)

D_{m,i}^{l+1} = D_{m,i}^l + \text{softmax}\left(\frac{Q_{m,i}^l (K_m^l)^T}{\sqrt{d_k}}\right) D_m^l

D_m^{l+1} = D_m^l + \text{softmax}\left(\frac{Q_m^l (K_{m,i}^l)^T}{\sqrt{d_k}}\right) D_{m,i}^l

此交互使点获得全局约束，元素获得细节优化。 最终，融合特征送入分类头、关键点头和掩码头，分别预测元素类别、关键点坐标和顺序、元素掩码。

图 5：通过三个层面的交互实现点和元素耦合（PEC），其中点到点交互用于同一元素各点间及每点的局部信息学习，元素到元素交互用于不同元素间的关系约束和每个元素的语义信息学习，点到元素交互用于为其构成点补充元素级信息学习。
4. 实验结果

SuperMapNet 的性能在 nuScenes 和 Argoverse2 两个权威数据集上得到了充分验证。在 nuScenes 数据集的硬设置和易设置下，SuperMapNet 分别实现了 66.5 mAP 和 86.6 mAP 的卓越性能，相比之前的最佳方法分别提高了 14.9 mAP 和 8.8 mAP。在 Argoverse2 数据集上，SuperMapNet 同样表现出色，在硬设置和易设置下分别超越现有最佳方法 18.5 mAP 和 3.1 mAP。这些结果表明，SuperMapNet 不仅在感知范围上达到了 120 米（是其他比较方法的两倍），而且在地图元素的分类和定位精度上也实现了质的飞跃。此外，SuperMapNet 的训练周期更短（仅 30 个周期），模型参数数量与现有方法相当，推理延迟也处于可接受范围内，展现出良好的实用潜力。

表 1：nuScenes数据集上与最佳方法的比较。所有方法中，最佳结果用粗体表示，次佳结果用下划线表示，基于最佳和次佳结果计算的增益用红色表示。比较方法的结果参考其论文。 “-”表示相应结果不可用。FPS在NVIDIA RTX 3090 GPU上以批量大小为1进行测量。“C”表示使用相机，“L”表示使用激光雷达。
表 2：Argoverse2数据集上与最佳方法的比较。所有方法中，最佳结果用粗体表示，次佳结果用下划线表示，基于最佳和次佳结果计算的增益用红色表示。比较方法的结果参考其论文。“-”表示相应结果不可用。“C”表示使用相机，“L”表示使用激光雷达。




表 3：nuScenes验证集上不同元素类型的精度。基于基线计算的增益用红色表示。
表 4：nuScenes验证集上不同阈值下的精度。基于基线计算的增益用红色表示。
图 6：在nuScenes数据集上SuperMapNet不同模块的可视化比较，其中蓝色圈出的是形状错误，黄色的是元素间的纠缠。每个包含六列，(a)相机图像；(b)激光雷达点云；(c)真实值；(d)基线；(e)仅使用SGC模块的基线；(f)仅使用PEC模块的基线；(g)使用SGC和PEC模块的基线。
图 7：Argoverse2数据集上SuperMapNet的可视化结果，左边是真实值，右边是SuperMapNet的预测结果。
5. 本文总结

SuperMapNet 作为一种新型的矢量化高清地图构建网络，凭借其创新的语义 - 几何耦合和点 - 元素耦合机制，在长距离和高精度地图构建方面取得了显著成果。它不仅有效解决了现有方法中存在的感知范围有限、特征空洞以及地图元素分类与定位精度不足等问题，还为自动驾驶系统提供了更加可靠、智能的地图支持。

随着自动驾驶技术的不断推进，SuperMapNet 有望在实际应用中发挥重要作用，为车辆的安全行驶保驾护航。未来的研究可以进一步探索如何优化 SuperMapNet 的架构和算法，以适应更加复杂多样的驾驶场景，同时降低计算成本，提高实时性。


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-b3170074dbe18e6c428197a687e9d98b_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic3.zhimg.com/v2-b280e678cc5e6e61b9221b8f32d7be36_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-147c94dd8c61a1524a114810a9c954cf_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-a3fcdffb426baea138f66dfd8af97dee_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-0541783857bbc69c098f2ab06050c510_1440w.jpg)

![图片](https://picx.zhimg.com/v2-1668833d277526f396455beca7dfbdd7_1440w.jpg)

![图片](https://picx.zhimg.com/v2-5d0c35af8cc4f38526cb3170b2c357c5_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-f4405474c0f7f80f15e9ce9bbf18423d_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-c1abee1cb37b7489417d868c2087160d_1440w.jpg)

![图片](https://pica.zhimg.com/v2-1671863c627d8329e6ed6bcf23862d2e_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-c6fc59e703b080a425f40aa9364450b6_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-693e28c2e800b5651a9c22f186c690e0_1440w.jpg)

![图片](https://pica.zhimg.com/v2-5f6dd46ace94af40e503c1e6a8c0a34d_bh.webp?source=d6434cab)

![图片](https://pic2.zhimg.com/v2-25d9de2e2b8d4971d2c24574387ab4c0_xl.webp?source=d6434cab)

![图片](https://picx.zhimg.com/v2-58869f8cf10b4621e41f251a73510fb6_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-48d6cb578feaa11f8983667c2251dd88_250x0.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-86dc428f8cee8238418bd7d901276ac9_250x0.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-de053b287c5e71e41713aab176990984_250x0.jpg?source=172ae18b)

