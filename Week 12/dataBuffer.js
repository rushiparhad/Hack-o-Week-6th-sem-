class RollingDataBuffer {
  constructor(maxPoints = 60) {
    this.maxPoints = maxPoints;
    this.points = [];
  }

  add(point) {
    this.points.push(point);
    if (this.points.length > this.maxPoints) {
      this.points.splice(0, this.points.length - this.maxPoints);
    }
  }

  snapshot() {
    return [...this.points];
  }

  latest() {
    return this.points.length ? this.points[this.points.length - 1] : null;
  }
}

module.exports = RollingDataBuffer;
