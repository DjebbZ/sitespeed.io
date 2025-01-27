'use strict';

const h = require('../../../support/helpers');
const get = require('lodash.get');

function infoBox(stat, name, formatter, url) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  return _box(stat, name, 'info', formatter, url);
}

function scoreBox(stat, name, url) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  return _box(stat, name, h.scoreLabel(stat.median), h.noop, url);
}

function metricBox(stat, name, score, formatter, url) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  return _box(stat, name, h.scoreLabel(score.median), formatter, url);
}

function _box(stat, name, label, formatter, url) {
  const median = formatter ? formatter(stat.median) : stat.median;
  const p90 = formatter ? formatter(stat.p90) : stat.p90;

  return {
    name,
    label,
    median,
    p90,
    url
  };
}

module.exports = function(data) {
  if (!data) {
    return [];
  }

  const boxes = [];
  const coach = data.coach;
  const pagexray = data.pagexray;
  const browsertime = data.browsertime;
  const webpagetest = data.webpagetest;
  const axe = data.axe;
  // coach
  if (coach) {
    const summary = coach.summary;

    boxes.push(
      scoreBox(summary.score, 'Overall score', 'overallScore'),
      scoreBox(
        summary.performance.score,
        'Performance score',
        'performanceScore'
      ),
      scoreBox(
        summary.accessibility.score,
        'Accessibility score',
        'accessibilityScore'
      ),
      scoreBox(
        summary.bestpractice.score,
        'Best Practice score',
        'bestPracticeScore'
      ),
      scoreBox(
        summary.performance.fastRender,
        'Fast Render advice',
        'fastRender'
      ),
      scoreBox(
        summary.performance.avoidScalingImages,
        'Avoid scaling images advice',
        'avoidScalingImages'
      ),
      scoreBox(
        summary.performance.compressAssets,
        'Compress assets advice',
        'compressAssets'
      ),
      scoreBox(
        summary.performance.optimalCssSize,
        'Optimal CSS size advice',
        'optimalCssSize'
      )
    );
  }

  if (pagexray && coach) {
    const cSum = coach.summary;
    const pxSum = pagexray.summary;

    boxes.push(
      metricBox(
        pxSum.transferSize,
        'Total size (transfer)',
        cSum.performance.pageSize,
        h.size.format,
        'pageSize'
      ),
      metricBox(
        pxSum.contentTypes.image.transferSize,
        'Image size (transfer)',
        cSum.performance.imageSize,
        h.size.format,
        'imageSize'
      ),
      metricBox(
        pxSum.contentTypes.javascript.transferSize,
        'Javascript size (transfer)',
        cSum.performance.javascriptSize,
        h.size.format,
        'javascriptSize'
      ),
      metricBox(
        pxSum.contentTypes.css.transferSize,
        'CSS size (transfer)',
        cSum.performance.cssSize,
        h.size.format,
        'cssSize'
      )
    );
  }

  if (axe) {
    boxes.push(
      _box(
        axe.summary.violations.critical,
        'Axe Critical Violations',
        axe.summary.violations.critical.median > 0 ? 'error' : 'ok',
        h.noop
      ),
      _box(
        axe.summary.violations.serious,
        'Axe Serious Violations',
        axe.summary.violations.serious.median > 0 ? 'error' : 'ok',
        h.noop
      ),
      _box(
        axe.summary.violations.minor,
        'Axe Minor Violations',
        axe.summary.violations.minor.median === 0
          ? 'ok'
          : axe.summary.violations.minor.median > 5
            ? 'error'
            : 'warning',
        h.noop
      ),
      _box(
        axe.summary.violations.moderate,
        'Axe Moderate Violations',
        axe.summary.violations.moderate.median === 0
          ? 'ok'
          : axe.summary.violations.moderate.median > 5
            ? 'error'
            : 'warning',
        h.noop
      )
    );
  }

  // no matching rules
  if (pagexray) {
    const summary = pagexray.summary;

    boxes.push(
      infoBox(summary.requests, 'Total requests'),
      infoBox(summary.contentTypes.image.requests, 'Image requests'),
      infoBox(summary.contentTypes.css.requests, 'CSS requests'),
      infoBox(summary.contentTypes.javascript.requests, 'Javascript requests'),
      infoBox(summary.contentTypes.font.requests, 'Font requests'),
      infoBox(summary.responseCodes['200'], '200 responses'),
      infoBox(summary.responseCodes['301'], '301 responses'),
      // TODO if we have more than ZERO it should be red
      infoBox(summary.responseCodes['404'], '404 responses'),
      infoBox(summary.domains, 'Domains per page'),
      infoBox(summary.expireStats, 'Cache time', h.time.duration),
      infoBox(
        summary.lastModifiedStats,
        'Time since last modification',
        h.time.duration
      )
    );

    if (summary.firstParty) {
      boxes.push(
        infoBox(summary.firstParty.requests, '1st party requests'),
        infoBox(
          summary.firstParty.transferSize,
          '1st party size',
          h.size.format
        )
      );
    }

    if (summary.thirdParty) {
      boxes.push(
        infoBox(summary.thirdParty.requests, '3rd party requests'),
        infoBox(
          summary.thirdParty.transferSize,
          '3rd party sizes',
          h.size.format
        )
      );
    }
  }

  if (browsertime) {
    const summary = browsertime.summary;

    boxes.push(
      infoBox(
        summary.rumSpeedIndex,
        'RUM Speed Index',
        h.noop,
        'rumSpeedIndex'
      ),
      infoBox(summary.firstPaint, 'First Paint', h.time.ms, 'firstPaint'),
      infoBox(
        summary.pageTimings.backEndTime,
        'Backend Time',
        h.time.ms,
        'backEndTime'
      ),
      infoBox(
        summary.pageTimings.frontEndTime,
        'Frontend Time',
        h.time.ms,
        'frontEndTime'
      ),
      infoBox(
        summary.pageTimings.pageLoadTime,
        'Page Load Time',
        h.time.ms,
        'pageLoadTime'
      ),
      infoBox(
        summary.fullyLoaded,
        'Fully Loaded Time',
        h.time.ms,
        'fullyLoaded'
      )
    );

    if (summary.visualMetrics) {
      boxes.push(
        infoBox(
          summary.visualMetrics.FirstVisualChange,
          'First Visual Change',
          h.time.ms
        ),
        infoBox(summary.visualMetrics.SpeedIndex, 'Speed Index', h.time.ms),
        infoBox(
          summary.visualMetrics.PerceptualSpeedIndex,
          'Perceptual Speed Index',
          h.time.ms
        ),
        infoBox(
          summary.visualMetrics.VisualComplete85,
          'Visual Complete 85%',
          h.time.ms
        ),
        infoBox(
          summary.visualMetrics.VisualComplete95,
          'Visual Complete 95%',
          h.time.ms
        ),
        infoBox(
          summary.visualMetrics.VisualComplete99,
          'Visual Complete 99%',
          h.time.ms
        ),
        infoBox(
          summary.visualMetrics.LastVisualChange,
          'Last Visual Change',
          h.time.ms
        )
      );
      if (summary.visualMetrics.LargestImage) {
        boxes.push(
          infoBox(
            summary.visualMetrics.LargestImage,
            'Largest Image',
            h.time.ms
          )
        );
      }
      if (summary.visualMetrics.Heading) {
        boxes.push(
          infoBox(summary.visualMetrics.Heading, 'Heading', h.time.ms)
        );
      }
      if (summary.visualMetrics.Logo) {
        boxes.push(infoBox(summary.visualMetrics.Logo, 'Logo', h.time.ms));
      }
    }

    if (summary.custom) {
      for (let key of Object.keys(summary.custom)) {
        boxes.push(infoBox(summary.custom[key], key));
      }
    }

    if (summary.cpu) {
      if (summary.cpu.longTasks) {
        boxes.push(
          infoBox(summary.cpu.longTasks.tasks, 'CPU Long Tasks', h.noop)
        );
        boxes.push(
          infoBox(
            summary.cpu.longTasks.totalDuration,
            'CPU Long Tasks total duration',
            h.time.ms
          )
        );
      }
    }
  }

  if (webpagetest) {
    const firstView = get(webpagetest, 'summary.timing.firstView');
    if (firstView) {
      boxes.push(
        infoBox(firstView.render, 'WPT render (firstView)'),
        infoBox(
          firstView.SpeedIndex,
          'WPT SpeedIndex (firstView)',
          h.noop,
          'SpeedIndex'
        ),
        infoBox(firstView.fullyLoaded, 'WPT Fully loaded (firstView)')
      );
    }
  }

  return boxes;
};
