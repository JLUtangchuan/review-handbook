---
title: "【端到端】VADv2学习笔记-01-模型框架VAD_base_e2e.py"
author: "智驾工程笔记"
source_url: https://zhuanlan.zhihu.com/p/17310254912
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 【端到端】VADv2学习笔记-01-模型框架VAD_base_e2e.py

> 作者: 智驾工程笔记 | 来源: https://zhuanlan.zhihu.com/p/17310254912

---

VAD的简介在之前文章中已经详细介绍过了，下面就不赘述了，需要的请看此篇本章。

这里主要根据其代码工程，一步步深入理解。

1. 模型框架VAD_base_e2e.py

整个文件可以看出来用到了哪些模型，能侧面反映出整体架构。

该配置文件主要定义了一个基于mmdetection3d的车辆感知检测模型（VAD），并针对特定任务进行了详细的配置。通过继承基础配置文件，定义插件、设置点云和图像处理参数、指定模型结构、配置数据集和训练优化策略以及日志方式，确保了模型能够在给定的数据集上进行有效的训练和评估。

1. 基础配置
_base_ = [
    '../datasets/custom_nus-3d.py',
    '../_base_/default_runtime.py'
] 
继承配置：该文件继承了两个基础配置文件：
custom_nus-3d.py：定义了自定义数据集的相关配置。
default_runtime.py：定义了默认的运行时配置（如日志、检查点等）。
2. 插件配置
plugin = True
 plugin_dir = 'projects/mmdet3d_plugin/'
插件启用：启用插件功能，并指定了插件目录projects/mmdet3d_plugin/，这表示会加载该目录下的自定义模块或拓展功能。
3. 点云范围和图像归一化配置
point_cloud_range = [-15.0, -30.0, -2.0, 15.0, 30.0, 2.0]
voxel_size = [0.15, 0.15, 4]

img_norm_cfg = dict(
    mean=[123.675, 116.28, 103.53], 
    std=[58.395, 57.12, 57.375], 
    to_rgb=True)
点云范围：定义了点云的空间范围。
体素大小：定义了体素化时用的体素大小。
图像归一化配置：定义了图像输入的归一化参数。
4. 类别定义
class_names = ['wallcolumn', 'car', 'person', 'curbstone', 'driveable_surface', 'traffic_cone']
num_classes = len(class_names)

map_classes = ['divider', 'ped_crossing', 'boundary']
map_num_vec = 100
map_fixed_ptsnum_per_gt_line = 20
map_fixed_ptsnum_per_pred_line = 20
map_eval_use_same_gt_sample_num_flag = True
map_num_classes = len(map_classes)
类别名称：定义了检测的目标类别：墙柱、车、人、路沿、可行驶表面、 交通锥。
地图类别：定义了地图元素的类别及其相关参数：车道分隔线、十字路口、道路边界。
5. 输入模态配置
input_modality = dict(
    use_lidar=False,
    use_camera=True,
    use_radar=False,
    use_map=False,
    use_external=True)
输入模态：指定了模型使用的传感器类型，当前仅使用相机图像。
6. 模型配置
model = dict(
    type='VAD',
    use_grid_mask=True,
    video_test_mode=True,
    pretrained=dict(img='torchvision://resnet50'),
    ...
)
主要定义了模型的配置，包括模型类型、主干网络、颈部网络（Neck）、头部（Head）以及各种损失函数和训练设计
6.1 模型基本信息：
type='VAD' 指定模型的类型为 VAD（Vehicle-Aware Detection），这是一个自定义的检测模型。
use_grid_mask 启用网格掩码（Grid Mask），用于数据增强
video_test_mode 启用视频测试模式
pretrained=dict(img='torchvision://resnet50') 使用预训练的ResNet50模型作为图像主干网络
6.2 图像主干网络img_backbone：
type='ResNet' 定义了一个ResNet作为图像主干网络
depth=50 ResNet的深度为50层
num_stages=4 分为4个阶段
out_indices=(1, 2, 3) 输出中间特征图的索引
frozen_stages=1 冻结前1个阶段的参数
norm_cfg=dict(type='BN', requires_grad=False) 使用Batch Normalization，并且不更新其参数
norm_eval=True 在评估模式下冻结BN层
style='pytorch' 使用PyTorch风格的ResNet实现
6.3 特征金字塔网络img_neck:
type='FPN' 定义了一个特征金字塔网络（FPN）
in_channels=[512, 1024, 2048] 输入通道数
out_channels=_dim_ 输出通道数，设置为256
start_level=0 从第0层开始构建FPN
add_extra_convs='on_output', 在输出上添加额外的卷积层
num_outs=_num_levels_, 输出特征图的数量，设置为4
relu_before_extra_convs=True 在额外的卷积层之前应用ReLU激活函数
6.4 点云检测头 pts_bbox_head
这段代码配置了一个名为VADHead的检测头，用于自动驾驶场景中的多任务感知和预测，它结合了Transformer解码器、位置编码、损失函数等组件，以实现对车辆、地图元素和其他交通参与者的检测、分类和轨迹预测，下面是对各个部分的详细解释：
6.4.1 基本参数配置：
python
pts_bbox_head=dict(
    type='VADHead',
    map_thresh=0.5,
    dis_thresh=0.2,
    ...
type='VADHead': 指定使用的检测头类型为VADHead。
map_thresh=0.5: 地图匹配的阈值，用于确定地图元素是否有效。
dis_thresh=0.2: 距离阈值，用于过滤无效的目标。
pe_normalization=True: 是否对位置编码进行归一化。
tot_epoch=total_epochs: 总训练轮数，引用了外部变量total_epochs。
use_traj_lr_warmup=False: 是否使用轨迹学习率预热。
query_thresh=0.0: 查询阈值，用于过滤查询结果。
query_use_fix_pad=False: 是否使用固定填充查询。
ego_his_encoder=None: 自车历史编码器，当前未定义。
ego_lcf_feat_idx=None: 自车局部特征索引，当前未定义。
valid_fut_ts=6: 有效的未来时间戳数量。
6.4.2 ego_agent_decoder解码器配置
ego_agent_decoder=dict(
    type='CustomTransformerDecoder',
    num_layers=1,
    return_intermediate=False,
    transformerlayers=dict(
        type='BaseTransformerLayer',
        attn_cfgs=[
            dict(
                type='MultiheadAttention',
                embed_dims=_dim_,
                num_heads=8,
                dropout=0.1),
        ],
        feedforward_channels=_ffn_dim_,
        ffn_dropout=0.1,
        operation_order=('cross_attn', 'norm', 'ffn', 'norm'))),
自车代理解码器，用于解码自车的特征。
type='CustomTransformerDecoder': 使用自定义的 Transformer 解码器。
num_layers=1: 解码器层数。
return_intermediate=False: 是否返回中间层输出。
transformerlayers: Transformer 层配置。
attn_cfgs: 注意力机制配置。
type='MultiheadAttention': 使用多头注意力机制
embed_dims=dim: 嵌入维度，引用了外部变量 _dim_。
num_heads=8: 多头注意力的头数。
dropout=0.1: 注意力层的dropout概率。
feedforward_channels=ffn_dim: 前馈网络的通道数，引用了外部变量 _ffn_dim_。
ffn_dropout=0.1: 前馈网络的dropout概率。
operation_order=('cross_attn', 'norm', 'ffn', 'norm'): 操作顺序，包括交叉注意力、归一化、前馈网络和归一化。
6.4.3 其他解码器配置，类似ego_agent_decoder，有：
地图解码器配置ego_map_decoder用于解码地图特征；
运动解码器配置motion_decoder用于解码运动特征；
运动地图解码器配置motion_map_decoder用于解码运动和运动特征。
6.4.4 其他配置
use_pe=True: 是否使用位置编码
bev_h=bev_h_: BEV高度
bev_w=bev_w_: BEV宽度
num_query=300: 查询的数量
num_classes=num_classes: 类别数量
in_channels=dim: 输入通道数
sync_cls_avg_factor=True: 是否同步分类平均因子
with_box_refine=True: 启用边界框细化
as_two_stage=False: 是否作为两阶段模型
map_num_vec=map_num_vec: 地图向量数量
map_num_classes=map_num_classes: 地图类别数量
map_num_pts_per_vec=map_fixed_ptsnum_per_pred_line: 每个预测线的地图点数
map_num_pts_per_gt_vec=map_fixed_ptsnum_per_gt_line: 每个真实线的地图点数
map_query_embed_type='instance_pts': 地图查询嵌入类型
map_transform_method='minmax': 地图变换方法
map_gt_shift_pts_pattern='v2': 地图真实点便宜模式
map_dir_interval=1: 地图方向间隔
map_code_size=2: 地图编码大小
map_code_weights=[1.0, 1.0, 1.0, 1.0]: 地图编码权重
6.4.5 Transformer 配置
transformer=dict(
    type='VADPerceptionTransformer',
    ...
),
transformer 总体配置
type: 指定使用的Transformer类型为 VADPerceptionTransformer。
map_num_vec: 地图向量的数量
map_num_pts_per_vec: 每个地图向量的点数
rotate_prev_bev: 是否旋转之前的BEV特征
use_shift: 是否使用位移操作
use_can_bus: 是否使用CAN总线数据
embed_dims: 嵌入维度
encoder 编码器配置
type: 使用的编码器类型为 BEVFormerEncoder。
num_layers: 编码器层数，共6层。
pc_range: 点云范围。
num_points_in_pillar: 每个柱状体中的点数。
return_intermediate: 是否返回中间层输出。
transformerlayers: 每层的具体配置：
attn_cfgs: 注意力机制配置，包含两个部分：
TemporalSelfAttention: 时间自注意力机制，用于处理时间序列数据。
SpatialCrossAttention: 空间交叉注意力机制，结合了可变形注意力机制 MSDeformableAttention3D，用于处理空间信息。
feedforward_channels: 前馈网络通道数。
ffn_dropout: 前馈网络的dropout率。
operation_order: 操作顺序：包括自注意力、归一化、交叉注意力、归一化、前馈网络和归一化。
decoder 解码器配置
type: 使用的解码器类型为 DetectionTransformerDecoder。
num_layers: 编码器层数，共6层。
return_intermediate: 是否返回中间层输出。
transformerlayers: 每层的具体配置：
attn_cfgs: 注意力机制配置，包含两个部分：
MultiheadAttention: 多头机制，可以捕捉到不同位置和特征之间的复杂关系。
CustomMSDeformableAttention: 可变性注意力机制，允许注意力权重根据输入特征动态调整采样位置，与传统的固定网格采样不同，可以灵活地选择更相关的特征点进行加权。
feedforward_channels: 前馈网络通道数。
ffn_dropout: 前馈网络的dropout率。
operation_order: 操作顺序：包括自注意力、归一化、交叉注意力、归一化、前馈网络和归一化。
map_decoder 地图解码器配置
与decoder 解码器配置类似
6.4.6 bbox_coder 编码器配置
type='CustomNMSFreeCoder'：指定使用的边界框编码器类型为 CustomNMSFreeCoder，这是一种自定义的非极大值抑制（NMS）自由编码器。
post_center_range=[-20, -35, -10.0, 20, 35, 10.0]：定义检测框中心点的范围，格式为 [x_min, y_min, z_min, x_max, y_max, z_max]，即在三维空间中的限制范围。
pc_range=point_cloud_range：点云数据的范围，通常与 post_center_range 相关，确保点云数据在相同的坐标系内。
max_num=100：最多输出的检测框数量，设置为 100。
voxel_size=voxel_size：体素（voxel）的大小，用于将点云数据离散化。
num_classes=num_classes：类别数量，表示模型需要识别的不同目标类别数。
6.4.7 map_bbox_coder 编码器配置
type='MapNMSFreeCoder'：指定使用的地图边界框编码器类型为 MapNMSFreeCoder，适用于地图元素的检测。
post_center_range=[-20, -35, -20, -35, 20, 35, 20, 35]：定义地图检测框中心点的范围，格式为 [x1_min, y1_min, x2_min, y2_min, x1_max, y1_max, x2_max, y2_max]，即在二维平面上的限制范围。
pc_range=point_cloud_range：点云数据的范围。
max_num=50：最多输出的地图检测框数量，设置为 50。
voxel_size=voxel_size：体素大小。
num_classes=map_num_classes：地图类别数量，表示模型需要识别的不同地图元素类别数。
6.4.8 positional_encoding 位置编码器
type='LearnedPositionalEncoding'： 使用学习型位置编码，帮助模型理解不同位置的特征。
num_feats=_pos_dim_： 位置编码的特征维度，用 _pos_dim_ 表示。
row_num_embed=bev_h_： BEV的高度，用 bev_h_ 表示。
col_num_embed=bev_w_： BEV的宽度，用 bev_w_ 表示。
6.4.9 多个损失函数
分类损失 (loss_cls)
type='FocalLoss'：使用 Focal Loss 进行分类任务，特别适合处理类别不平衡问题。
use_sigmoid=True：是否使用 Sigmoid 函数进行二分类，设置为 True。
gamma=2.0：Focal Loss 的 gamma 参数，控制难易样本的权重。
alpha=0.25：Focal Loss 的 alpha 参数，调整正负样本的权重。
loss_weight=2.0：该损失的权重，设置为 2.0。
边界框回归损失 (loss_bbox)
type='L1Loss'：使用 L1 Loss 进行边界框回归任务。
loss_weight=0.25：该损失的权重，设置为 0.25。
轨迹回归损失 (loss_traj)
type='L1Loss'：使用 L1 Loss 进行轨迹回归任务。
loss_weight=0.2：该损失的权重，设置为 0.2。
轨迹分类损失 (loss_traj_cls)
type='FocalLoss'：使用 Focal Loss 进行轨迹分类任务。
use_sigmoid=True：是否使用 Sigmoid 函数进行二分类，设置为 True。
gamma=2.0：Focal Loss 的 gamma 参数。
alpha=0.25：Focal Loss 的 alpha 参数。
loss_weight=0.2：该损失的权重，设置为 0.2。
IoU 损失 (loss_iou)
type='GIoULoss'：使用 GIoU Loss 进行边界框匹配任务。
loss_weight=0.0：该损失的权重，设置为 0.0，表示不使用此损失。
地图分类损失 (loss_map_cls)
type='FocalLoss'：使用 Focal Loss 进行地图分类任务。
use_sigmoid=True：是否使用 Sigmoid 函数进行二分类，设置为 True。
gamma=2.0：Focal Loss 的 gamma 参数。
alpha=0.25：Focal Loss 的 alpha 参数。
loss_weight=2.0：该损失的权重，设置为 2.0。
地图边界框回归损失 (loss_map_bbox)
type='L1Loss'：使用 L1 Loss 进行地图边界框回归任务。
loss_weight=0.0：该损失的权重，设置为 0.0，表示不使用此损失。
地图 IoU 损失 (loss_map_iou)
type='GIoULoss'：使用 GIoU Loss 进行地图边界框匹配任务。
loss_weight=0.0：该损失的权重，设置为 0.0，表示不使用此损失。
地图点回归损失 (loss_map_pts)
type='PtsL1Loss'：使用 PtsL1Loss 进行地图点回归任务。
loss_weight=1.0：该损失的权重，设置为 1.0。
地图方向损失 (loss_map_dir)
type='PtsDirCosLoss'：使用 PtsDirCosLoss 进行地图方向预测任务。
loss_weight=0.005：该损失的权重，设置为 0.005。
规划回归损失 (loss_plan_reg)
type='L1Loss'：使用 L1 Loss 进行规划路径回归任务。
loss_weight=1.0：该损失的权重，设置为 1.0。
规划边界损失 (loss_plan_bound)
type='PlanMapBoundLoss'：使用 PlanMapBoundLoss 进行规划路径边界约束任务。
loss_weight=1.0：该损失的权重，设置为 1.0。
dis_thresh=1.0：距离阈值，设置为 1.0。
规划碰撞损失 (loss_plan_col)
type='PlanCollisionLoss'：使用 PlanCollisionLoss 进行规划路径碰撞检测任务。
loss_weight=1.0：该损失的权重，设置为 1.0。
规划方向损失 (loss_plan_dir)
type='PlanMapDirectionLoss'：使用 PlanMapDirectionLoss 进行规划路径方向预测任务。
loss_weight=0.5：该损失的权重，设置为 0.5。
6. 编码器和解码器配置
训练配置 train_cfg
配置了训练过程中的参数，特别是与点云处理和目标分配相关的设置。
grid_size: [512, 512, 1] 定义了用于网格化的尺寸，这里是一个二维的512x512网格，第三个维度为1。
voxel_size 定义了体素（voxel）的大小，通常用于将点云数据离散化。
point_cloud_range 定义了点云数据的空间范围，确保所有点都在这个范围内进行处理。
out_size_factor:4 输出特征图相对于输入特征图的缩小比例因子。
assigner 配置
type: 'HungarianAssigner3D' 使用匈牙利算法进行三维目标分配，确保每个预测框与真实框之间的最佳匹配。
cls_cost： type: 'FocalLossCost' weight: 2.0 分类损失的成本权重，使用Focal Loss来计算分类成本。
reg_cost: type: 'BBox3DL1Cost' weight: 0.25 回归损失的成本权重，使用L1损失来计算边界框回归成本。
iou_cost: type: 'IoUCost' weight: 0.0 IoU损失的成本权重，这里权重为0，表示不使用IoU损失。这是为了兼容DETR头。
pc_range: point_cloud_range 点云数据的空间范围，确保分配在有效范围内进行。
map_assigner 配置
type: 'MapHungarianAssigner3D' 使用匈牙利算法进行地图级别的三维目标分配。
cls_cost: type: 'FocalLossCost' weight: 2.0 分类损失的成本权重，使用Focal Loss来计算分类成本。
reg_cost: type: 'BBoxL1Cost' weight: 0.0 回归损失的成本权重，使用L1损失来计算边界框回归成本，权重为0表示不使用。
iou_cost: type: 'IoUCost' iou_mode: 'giou' weight: 0.0 IoU损失的成本权重，使用GIoU（Generalized IoU）来计算IoU成本，权重为0表示不使用。
pts_cost: type: 'OrderedPtsL1Cost' weight: 1.0 点云点的成本权重，使用有序点的L1损失来计算点云点的成本。
pc_range: point_cloud_range 点云数据的空间范围，确保分配在有效范围内进行。
7. 数据集配置
dataset_type = 'VADCustomNuScenesDataset'
data_root = 'data/dvr_data/vad_train_data/'
...
数据集类型：定义了自定义的数据集类型VADCustomNuScenesDataset。
数据根目录：指定了数据集的存储路径。
数据管道：定义了训练和测试数据的预处理步骤，包括图像加载、数据增强、标注加载等。
train pipeline 训练数据预处理管道:
LoadMultiViewImageFromFiles 加载多视角图像，并将其转换为浮点数格式。
PhotoMetricDistortionMultiViewImage 对多视角图像进行光度失真(如亮度、对比度)增强。
LoadAnnotations3D 加载三维标注信息，包括3D边界框、标签和属性标签。
CustomObjectRangeFilter 根据指定的点云范围过滤对象。
CustomObjectNameFilter 根据类别名称过滤对象。
NormalizeMultiviewImage 对多视角图像进行归一化处理，使用之前定义的归一化配置。
RandomScaleImageMultiViewImage 随机缩放多视角图像，比例为0.8.
PadMultiViewImage 对多视角图像进行填充，使其尺寸能够被32整除。
CustomDefaultFormatBundle3D 数据打包成默认的3D格式，包含类别名称并启用ego(自车)信息。
CustomCollect3D 收集特定键值的数据，用于后处理。键值包括地面真值3D边界框、标签、图像、历史轨迹、未来轨迹、掩码、命令、特征和属性标签。
test pipline 测试数据预处理管道:
LoadMultiViewImageFromFiles 加载多视角图像，并将其转换为浮点数格式。
LoadPointsFromFile 从文件中加载点云数据，坐标类型为LIDAR，加载维度为4，使用维度为4。
LoadAnnotations3D 加载三维标注信息，包括3D边界框、标签和属性标签。
CustomObjectRangeFilter 根据指定的点云范围过滤对象。
CustomObjectNameFilter 根据类别名称过滤对象。
NormalizeMultiviewImage 对多视角图像进行归一化处理，使用之前定义的归一化配置。
MultiScaleFlipAug3D 多尺度翻转增强，具体设置如下：图像缩放比例为（1600，900），点云缩放比例为1，不进行反转，
transformers包含一系列子变换：
RandomScaleImageMultiViewImage 随机缩放多视角图像，比例为0.8；
PadMultiViewImage 对多视角图像进行填充，使其尺寸能够被32整除；
CustomDefaultFormatBundle3D 将数据打包成默认的3D格式，包含类型名称但不带标签，并启用ego(自车)信息。
CustomCollect3D 收集特定键值的数据，用于后续处理。键值包括点云、地面真值3D边界框、标签、图像、未来有效标志、历史轨迹、未来轨迹、掩码、命令、特征和属性标签。
数据配置data:
samples_per_gpu 每个GPU的样本数为1；
workers_per_gpu 每个GPU使用4个数据加载工作线程；
train 训练数据集配置：
数据集类型为VADCustomNuScenesDataset
data_root 数据集根目录
ann_file 训练集 标注文件路径
pipeline 使用train_pipeline进行数据预处理
classes 目标类别
modality 输入模态配置
test_mode 是否为测试模式，设置为false为训练模式
use_valid_flag 是否使用有效的标志
bev_size BEV(鸟瞰图)大小
pc_range 点云范围
queue_length 队列长度
map_classes 地图类别
map_fixed_ptsnum_per_line 每条线的地图固定点数
map_eval_use_same_gt_sample_num_flag 评估时是否使用相同数量的地面真值样本
box_type_3d 3D框类型为LIDAR
custom_eval_version 自定义评估版本。
val 测试数据集配置：
类似于训练数据集配置，但使用test_pipeline和验证集标注文件路径。
use_pkl_result 是否使用pkl结果（作用？）
map_ann_file 地图标注文件路径
test 测试数据集配置
类似于验证数据集配置，但使用测试集标注文件路径
shuffler_sampler 使用分布式组采样器DistributedGroupSampler
nonshuffler_sampler 使用分布式采样器DistributedSampler
8. 训练和优化配置
python

optimizer = dict(
    type='AdamW',
    lr=2e-4,
    paramwise_cfg=dict(
        custom_keys={
            'img_backbone': dict(lr_mult=0.1),
        }),
    weight_decay=0.01)

lr_config = dict(
    policy='CosineAnnealing',
    warmup='linear',
    warmup_iters=500,
    warmup_ratio=1.0 / 3,
    min_lr_ratio=1e-3)

runner = dict(type='EpochBasedRunner', max_epochs=total_epochs)
优化器：使用AdamW优化器，学习率为 2e-4，并对主干网络的学习率进行了优化。
学习率调度：使用余弦退火策略进行学习率调整，带有线性预热阶段。
训练轮数：最大训练轮数为total_epochs轮。
9. 日志和检查点配置
python

log_config = dict(
    interval=20,
    hooks=[
        dict(type='TextLoggerHook'),
        dict(type='TensorboardLoggerHook')
    ])

checkpoint_config = dict(interval=1, max_keep_ckpts=total_epochs)
日志记录：每20步记录一次日志，并使用文本和 TensorBoard 进行日志记录。
检查点保存：每轮保存一次检查点，并最多保留所有轮次的检查点。
【知识点】训练数据集、验证数据集、测试数据集的区别？

在机器学习和深度学习中，数据集通常被划分为三个部分：训练数据集、验证数据集和测试数据集。每个数据集的作用不同，确保模型能够有效学习并泛化到未见过的数据上。

1. 训练数据集 (Training Dataset)
作用：用于训练模型，即通过反向传播算法调整模型的参数（权重和偏置），使模型能够学习到数据中的模式。
特点：
数据量通常较大，以提供足够的样本供模型学习。
包含标注信息（如标签、边界框等），用于监督学习。
在训练过程中，数据会经过各种预处理和增强操作（如图像增强、数据归一化等）。
2. 验证数据集 (Validation Dataset)
作用：用于评估模型在训练过程中的性能，并根据验证集上的表现调整超参数或进行早停（early stopping）。验证集帮助防止过拟合。
特点：
数据量通常小于训练集，但足够大以提供可靠的评估。
不参与模型参数的更新，仅用于评估。
使用与测试集相似的预处理管道，不包含数据增强操作（除非需要模拟真实场景）。
3. 测试数据集 (Test Dataset)
作用：用于最终评估模型的性能，特别是在完全未知的数据上的表现。测试集的结果反映了模型的真实泛化能力。
特点：
数据量通常较小，但应尽可能代表实际应用场景中的数据分布。
不参与训练和验证，确保评估结果的公正性。
使用与验证集相同的预处理管道，不包含数据增强操作。
总结
训练数据集：用于训练模型，包含大量带标注的数据，经过预处理和增强。
验证数据集：用于评估和调优模型，帮助防止过拟合，使用与测试集相似的预处理管道。
测试数据集：用于最终评估模型的泛化能力，确保评估结果的公正性和可靠性，不参与训练和验证。

这些数据集的划分和配置确保了模型能够在不同的阶段得到适当的训练、评估和最终测试，从而提高模型的性能和鲁棒性。

转载请注名出处：作者：自动驾驶转型者，原文链接：【端到端】VADv2学习笔记-01-模型框架VAD_base_e2e.py

欢迎点赞+收藏+关注，后续会出具体的系列~~关注越多更新越快

系列文章：端到端入门科普文章


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-d9cfa9380cfd2dc2b8c45df90c895d97_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic2.zhimg.com/v2-a3cf654f9fe4c2f3ad1a0708e93b0497_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-a2a5f6309a1d7ec257ff42199a38dd6c_720w.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-d9cfa9380cfd2dc2b8c45df90c895d97_l.jpg?source=172ae18b)

![图片](https://pic4.zhimg.com/v2-69f3e97db2a89a72c1e60e3653e2573f.webp)

![图片](https://pic1.zhimg.com/v2-24bd56c1444cc5d9e3565a89c8ddc58a_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-5ea285f70ca6c0c92f21c06388a28738_250x0.jpg?source=172ae18b)

