import { Component, ViewChild} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { ChartComponent, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexTitleSubtitle } from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'chaos';

  xValues = [];
  repeatingXValues = [];
  xValue = 0.500;
  rValue = 2.75;
  stepValue = 0.001;

  logisticMapValues = {
    x : [],
    r : [],
    t : []
  };
  logisticMapLimit = 150;
  logisticPrecision = 1000000000;

  runVar: any;

  @ViewChild('chart') chart: ChartComponent;
  chartOptions = {
    series: [
      {
        name: '',
        data: []
      }
    ],
    chart: {
      height: 350,
      type: 'line',
      animations: {
        enabled: false
      }
    },
    stroke: {
      show: true,
      curve: 'smooth',
      width: 1
    },
    title: {
      text: ''
    },
    xaxis: {
      labels: {
        rotate: 0,
      },
      categories: [],
      title: {
        text: 't'
      },
      tickAmount: 20
    },
    yaxis: {
      title: {
        text: 'x'
      }
    }
  };

  constructor() {
    this.reset();
  }

  renderChart(): void {
    this.chartOptions.series[0].data = this.xValues;
    this.chartOptions.xaxis.categories = this.logisticMapValues.t;
  }

  reset(): void {
    this.xValues = [];
    this.repeatingXValues = [];
    this.xValue = 0.500;
    // this.rValue = 2.750;
    this.rValue = 3;
    this.logisticMapValues = {
      x : [],
      r : [],
      t : []
    };
    this.logisticMapValues = {
      x : [this.xValue],
      r : [this.rValue],
      t : [1]
    };
    this.logisticMap();
    this.renderChart();
  }

  logisticMap() {
    let i = 2;
    let x = this.logisticMapValues.x[0];
    const r = this.logisticMapValues.r[0];
    while (i < this.logisticMapLimit ) {
      x = r * x * (1 - x);
      this.xValues.push(Math.ceil(x * this.logisticPrecision) / this.logisticPrecision);
      if (x <= 0 ) {
        x = 0;
      }
      this.logisticMapValues.x.push(x);
      this.logisticMapValues.r.push(r);
      this.logisticMapValues.t.push(i);
      if (x <= 0 ) {
        clearInterval(this.runVar);
        break;
      }
      i++;
    }
    this.findRepeatingValues(this.xValues[this.xValues.length - 1], 0);
  }

  findRepeatingValues(val, prev: number): void {
    if (this.xValues.indexOf(val) !== -1 && this.repeatingXValues.indexOf(val) === -1) {
      this.repeatingXValues.push(val);
    }
    if (this.repeatingXValues.length === prev) {
      return;
    }
    this.findRepeatingValues(this.xValues[this.xValues.length - 1 - this.repeatingXValues.length], this.repeatingXValues.length);
  }

  resetLogisticMapLimit(): void {
    this.logisticMapLimit = 150;
    clearInterval(this.runVar);
    this.xValues = [];
    this.repeatingXValues = [];
    this.logisticMapValues = {
      x : [this.xValue],
      r : [this.rValue],
      t : [1]
    };
    this.logisticMap();
    this.renderChart();
  }

  fixLogisticMapLimit(up: boolean): void {
    this.logisticMapLimit = up ? this.logisticMapLimit + 50 : this.logisticMapLimit - 50;
    if (this.logisticMapLimit < 50 ) {
      this.logisticMapLimit = 50;
    }
    clearInterval(this.runVar);
    this.xValues = [];
    this.repeatingXValues = [];
    this.logisticMapValues = {
      x : [this.xValue],
      r : [this.rValue],
      t : [1]
    };
    this.logisticMap();
    this.renderChart();
  }

  step(rate, up: boolean): void {
    if (rate) {
      this.rValue = up ? this.rValue + this.stepValue : this.rValue - this.stepValue;
      this.rValue = Math.ceil(this.rValue * 10000) / 10000;
    } else {
      this.xValue = up ? this.xValue + this.stepValue : this.xValue - this.stepValue;
      this.xValue = Math.ceil(this.xValue * 10000) / 10000;
    }
    this.xValues = [this.xValue];
    this.repeatingXValues = [];
    this.logisticMapValues = {
      x : [this.xValue],
      r : [this.rValue],
      t : [1]
    };
    this.logisticMap();
    this.renderChart();
  }

  startRun(): void {
    clearInterval(this.runVar);
    this.runVar = setInterval(() => {
      this.rValue = this.rValue + this.stepValue;
      this.rValue = Math.ceil(this.rValue * 100000) / 100000;
      this.xValues = [this.xValue];
      this.repeatingXValues = [];
      this.logisticMapValues = {
        x : [this.xValue],
        r : [this.rValue],
        t : [1]
      };
      this.logisticMap();
      this.renderChart();
    }, 250);
  }

  stopRun(): void {
    clearInterval(this.runVar);
  }

  roundValue(value, precision: number): number {
    return Math.ceil(value * precision) / precision;
  }


}
