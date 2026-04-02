from pydantic import BaseModel, Field


class TrainRequest(BaseModel):
    heart_rates: list[float] = Field(
        ...,
        min_length=10,
        description="Training heart-rate samples in bpm",
        examples=[[72, 75, 78, 80, 76, 74, 73, 77, 79, 81]],
    )
    contamination: float = Field(
        0.05,
        gt=0,
        lt=0.5,
        description="Expected outlier ratio in training data",
    )


class PredictRequest(BaseModel):
    heart_rates: list[float] = Field(
        ...,
        min_length=1,
        description="Heart-rate samples to evaluate in bpm",
        examples=[[70, 92, 44, 160]],
    )
