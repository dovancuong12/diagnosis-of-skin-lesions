DATA_DIR = r"data_skin"        

EPOCHS         = 100              #tổng epoch
FREEZE_EPOCHS  = 10               # số epoch train HEAD trước

BATCH_SIZE     = 32           
NUM_WORKERS    = 4               
SEED           = 42

LR_FROZEN      = 1e-3            # LR lớn cho HEAD
LR_FULL        = 1e-4            # LR nhỏ cho fine-tuning backbone
WEIGHT_DECAY   = 1e-4

EMBEDDING_DIM  = 256
PRETRAINED    = True             
USE_AMP        = True             
IMG_SIZE       = 224             

NORM_MEAN = [
    0.8189992308616638,
    0.7863569855690002,
    0.8062614798545837
]

NORM_STD = [
    0.20818482339382172,
    0.20231850445270538,
    0.20419003069400787
]

BEST_MODEL = r"./checkpoints/skin2/best_skin.pth"
LAST_MODEL = r"./checkpoints/skin2/last_skin.pth"

TRAINING_CURVES = r"./checkpoints/skin2/training_curves.png"