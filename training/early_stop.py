import torch


class EarlyStopping:
    
    def __init__(self, checkpoint_path, patience=5, min_delta=1e-4, verbose=True):
        self.checkpoint_path = checkpoint_path
        self.patience = patience
        self.min_delta = min_delta
        self.verbose = verbose

        self.best_loss = float("inf")
        self.counter = 0
        self.early_stop = False

    def __call__(self, val_loss, model, extra=None):
        if val_loss < self.best_loss - self.min_delta:
            self.best_loss = val_loss
            self.counter = 0

            ckpt = {
                "model_state": model.state_dict(),
            }

            if extra:
                ckpt.update(extra)

            torch.save(ckpt, self.checkpoint_path)

            if self.verbose:
                phase = ckpt.get("training_phase", "unknown")
                print(
                    f"✅ Saved BEST (val_loss={self.best_loss:.6f}, phase={phase})"
                )
        else:
            self.counter += 1
            if self.verbose:
                print(f"⏸ No improvement ({self.counter}/{self.patience})")

            if self.counter >= self.patience:
                self.early_stop = True
                if self.verbose:
                    print("🛑 Early stopping triggered")
