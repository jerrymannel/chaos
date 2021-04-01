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
  xValue = 0.4;
  rValue = 2.8;
  stepValue = 0.005;

  logisticMapValues = [];
  logisticMapLimit = 150;

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
    categoryAxis.renderer.minGridDistance = 50;
    categoryAxis.dataFields.category = 't';
    categoryAxis.title.text = 'Year(time)';

    const valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.tooltip.disabled = true;
    valueAxis.renderer.minWidth = 35;
    valueAxis.renderer.minGridDistance = 100;
    valueAxis.title.text = 'Population(x)';

    const series = this.chart.series.push(new am4charts.LineSeries());
    series.dataFields.categoryX = 't';
    series.dataFields.valueY = 'x';
    series.strokeWidth = 2;
    series.stroke = am4core.color('blue');
    series.tooltipText = '{valueY.value}';

    this.chart.scrollbarX = new am4core.Scrollbar();
    this.chart.scrollbarY = new am4core.Scrollbar();

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
      x = Math.ceil(x * 10000) / 10000;
      if (x <= 0 ) {
        x = 0;
      }
      this.xValues.push(x);
      this.logisticMapValues.push({ x, r, t: i });
      i++;
    }
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterContentInit() {
    this.browserOnly(() => {
      this.initChart();
      this.render();
    });
  }

  render(): void {
    this.logisticMapValues = [{x: this.xValue, r: this.rValue, t: 1 }];
    this.logisticMap();
    this.renderChart();
  }

  stepXRun(): void {
    this.xValue = this.xValue + this.stepValue;
    this.xValues = [this.xValue];
    this.logisticMapValues = [{x: this.xValue, r: this.rValue, t: 1 }];
    this.logisticMap();
    this.renderChart();
  }

  stepTRun(): void {
    this.rValue = this.rValue + this.stepValue;
    this.xValues = [this.xValue];
    this.logisticMapValues = [{x: this.xValue, r: this.rValue, t: 1 }];
    this.logisticMap();
    this.renderChart();
    // setTimeout(() => {
    //   this.stepTRun();
    // }, 500);
  }


}
