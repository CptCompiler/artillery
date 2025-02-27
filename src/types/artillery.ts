export interface ArtilleryReport {
  aggregate: {
    counters: {
      [key: string]: number;
    };
    rates: {
      [key: string]: number;
    };
    firstCounterAt: number;
    lastCounterAt: number;
    firstMetricAt: number;
    lastMetricAt: number;
    period: number;
    summaries: {
      [key: string]: MetricSummary;
    };
    histograms: {
      [key: string]: MetricHistogram;
    };
  };
  intermediate: IntermediateResult[];
}

export interface MetricSummary {
  min: number;
  max: number;
  count: number;
  mean: number;
  p50: number;
  median: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
  p999: number;
}

export type MetricHistogram = MetricSummary;

export interface IntermediateResult {
  counters: {
    [key: string]: number;
  };
  rates: {
    [key: string]: number;
  };
  firstCounterAt: number;
  lastCounterAt: number;
  firstMetricAt: number;
  lastMetricAt: number;
  period: string;
  summaries: {
    [key: string]: MetricSummary;
  };
  histograms: {
    [key: string]: MetricHistogram;
  };
} 