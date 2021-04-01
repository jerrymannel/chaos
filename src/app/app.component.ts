import { Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';


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

  logisticMapValues = [];
  logisticMapLimit = 150;
  logisticPrecision = 1000000000;

  runVar: any;

  chart: any;
  interfaceColors = new am4core.InterfaceColorSet();

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private zone: NgZone
  ) {}

  initChart(): void {
    this.chart = am4core.create('chartdiv', am4charts.XYChart);
    // am4core.useTheme(am4themes_animated);

    am4core.options.autoSetClassName = true;

    const categoryAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    // categoryAxis.renderer.grid.template.disabled = true;
    // categoryAxis.renderer.labels.template.disabled = true;
    categoryAxis.min = 0;
    categoryAxis.max = this.logisticMapLimit;
    categoryAxis.renderer.minGridDistance = 50;
    categoryAxis.dataFields.category = 't';
    categoryAxis.title.text = 'Year(time)';

    const valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
    // valueAxis.renderer.grid.template.disabled = true;
    valueAxis.renderer.labels.template.disabled = true;
    valueAxis.min = 0;
    valueAxis.max = 1;
    valueAxis.tooltip.disabled = true;
    valueAxis.renderer.minWidth = 35;
    valueAxis.renderer.minGridDistance = 1;
    valueAxis.title.text = 'Population(x)';

    const range0 = valueAxis.axisRanges.create();
    range0.value = 0;
    range0.label.text = '0';

    const range500 = valueAxis.axisRanges.create();
    range500.value = 0.5;
    range500.label.text = '0.5';

    const range1000 = valueAxis.axisRanges.create();
    range1000.value = 1;
    range1000.label.text = '1';

    const series = this.chart.series.push(new am4charts.LineSeries());
    series.dataFields.categoryX = 't';
    series.dataFields.valueY = 'x';
    series.strokeWidth = 2;
    series.stroke = am4core.color('#2979ff');
    series.tooltipText = '{valueY.value}';

    this.chart.scrollbarX = new am4core.Scrollbar();
    // this.chart.scrollbarY = new am4core.Scrollbar();

    this.chart.cursor = new am4charts.XYCursor();
  }

  renderChart(): void {
    this.chart.data = this.logisticMapValues;
  }

  browserOnly(f: () => void) {
    console.log(this.platformId);
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  logisticMap() {
    let i = 2;
    let x = this.logisticMapValues[0].x;
    const r = this.logisticMapValues[0].r;
    while (i < this.logisticMapLimit ) {
      x = r * x * (1 - x);
      this.xValues.push(Math.ceil(x * this.logisticPrecision) / this.logisticPrecision);
      if (x <= 0 ) {
        x = 0;
      }
      this.logisticMapValues.push({ x, r, t: i });
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

  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterContentInit() {
    this.browserOnly(() => {
      this.initChart();
      this.reset();
    });
  }

  reset(): void {
    this.xValues = [];
    this.repeatingXValues = [];
    this.xValue = 0.500;
    // this.rValue = 2.750;
    this.rValue = 3;
    this.logisticMapValues = [];
    this.logisticMapValues = [{x: this.xValue, r: this.rValue, t: 1 }];
    this.logisticMap();
    this.renderChart();
  }

  resetLogisticMapLimit(): void {
    this.logisticMapLimit = 150;
    clearInterval(this.runVar);
    this.xValues = [];
    this.repeatingXValues = [];
    this.logisticMapValues = [{x: this.xValue, r: this.rValue, t: 1 }];
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
    this.logisticMapValues = [{x: this.xValue, r: this.rValue, t: 1 }];
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
    this.logisticMapValues = [{x: this.xValue, r: this.rValue, t: 1 }];
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
      this.logisticMapValues = [{x: this.xValue, r: this.rValue, t: 1 }];
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
