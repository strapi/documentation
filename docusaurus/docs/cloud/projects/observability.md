---
title: Project observability
displayed_sidebar: cloudSidebar
description: Monitor API requests, bandwidth, asset storage, and CPU and Memory usage directly from your Strapi Cloud project dashboard.
canonicalUrl: https://docs.strapi.io/cloud/projects/observability.html
tags:
  - observability
  - metrics
  - API usage
  - bandwidth
  - Strapi Cloud
---

# Cloud project observability

<Tldr>

The Observability tab surfaces usage metrics, endpoint traffic, and infrastructure health data directly from your project dashboard. Use it to monitor API and bandwidth consumption, identify high-traffic endpoints, and track CPU and Memory usage over time.

</Tldr>

The *Observability* tab is accessible from your project dashboard. It contains 4 sections: [Summary](#summary), [Project consumption](#project-consumption), [Traffic insights](#traffic-insights), and [CPU and Memory usage](#cpu-and-memory-usage).

## Summary

The *Summary* section displays a monthly overview of your resource consumption and any overage charges.

<ThemedImage
  alt="Observability: Summary"
  sources={{
    light: '/img/assets/cloud/observability-summary.png',
    dark: '/img/assets/cloud/observability-summary_DARK.png',
  }}
/>

Use the month picker in the top-right corner of the section to view previous months.

The section contains 4 metric cards:

| Card | Description |
|------|-------------|
| API requests | Total API requests for the month, shown against your plan limit with a progress bar. Displays overage charges if the limit was exceeded. |
| Asset bandwidth | Total bandwidth consumed for the month, shown against your plan limit with a progress bar. Displays overage charges if the limit was exceeded. |
| Asset storage | Storage used per environment. Each environment shows a progress bar with its usage against its limit. Displays overage charges if the limit was exceeded on any environment at any point throughout the month. |
| Overage charges | Total overage amount for the month, excluding applicable taxes. |

API requests data is available in real time, whereas Asset bandwidth and Asset storage are updated hourly. To update these metrics, refresh the dashboard.

:::tip
For more information on usage billing and overage management, see [Usage & Billing](/cloud/getting-started/usage-billing).
:::

## Project consumption

The *Project consumption* section shows API requests and asset bandwidth usage over time, broken down by environment.

<ThemedImage
  alt="Observability: Project consumption"
  sources={{
    light: '/img/assets/cloud/observability-project-consumption.png',
    dark: '/img/assets/cloud/observability-project-consumption_DARK.png',
  }}
/>

Use the time range selector in the top-right corner to adjust the period displayed:

| Time range | Plan availability |
|------------|-------------------|
| 24h | All plans |
| 7d | All plans |
| 14d | <CloudProBadge /> <CloudBusinessBadge /> |
| 30d | <CloudProBadge /> <CloudBusinessBadge /> |
| 60d | <CloudBusinessBadge /> |

The section contains 2 charts:

- API requests: total API calls across all environments, displayed as a stacked bar chart.
- Asset bandwidth: total data transferred for assets across all environments, using the same stacked bar format.

Each bar represents a time bucket (hourly or daily, depending on the selected range) and is stacked by environment. Hover over the chart to see a tooltip showing the consumption breakdown per environment at a specific point in time. To filter out environments from the graph, click on their name in the legend.

## Traffic insights

The *Traffic insights* section shows which API endpoints and assets generate the most traffic for the selected environment and time range.

<ThemedImage
  alt="Observability: Traffic insights"
  sources={{
    light: '/img/assets/cloud/observability-traffic-insights.png',
    dark: '/img/assets/cloud/observability-traffic-insights_DARK.png',
  }}
/>

Use the *environment* dropdown and the time range selector to filter the data. The available time ranges are the same as in [Project consumption](#project-consumption).

### Top endpoints by API traffic

The *Top endpoints by API traffic* table lists the 5 API endpoints that received the most requests in the selected period and displays the following metrics:

| Column | Description |
|--------|-------------|
| Endpoint | The matched API route path. |
| Requests | Total number of requests in the selected period. |
| P50 (ms) | Median response time. 50% of requests completed faster than this value. |
| P95 (ms) | 95th percentile response time. 95% of requests completed faster than this value. |
| P99 (ms) | 99th percentile response time. 99% of requests completed faster than this value. |
| Max (ms) | The highest single response time recorded in the selected period. |
| Error rate (%) | Percentage of requests that returned a 4xx response. |

### Top assets by bandwidth usage

The *Top assets by bandwidth usage* table lists the 5 assets that consumed the most bandwidth in the selected period and displays the following metrics:

| Column | Description |
|--------|-------------|
| Asset path | The file path of the asset. |
| Total bandwidth | Total data transferred for this asset in the selected period. |

## CPU and Memory usage

The *CPU and Memory over time* section shows your application's CPU and Memory consumption as a percentage of the available resources.

<ThemedImage
  alt="Observability: CPU and Memory over time"
  sources={{
    light: '/img/assets/cloud/observability-cpu-memory.png',
    dark: '/img/assets/cloud/observability-cpu-memory_DARK.png',
  }}
/>

The section displays a single area chart with 2 series:

- CPU: displayed as a blue dashed line
- Memory: displayed as a green solid line

Use the *environment* dropdown to select which environment's metrics to display and the time range selector to adjust the period. Hover over the chart to see a tooltip showing the CPU and Memory values at a specific point in time. Data is displayed hourly or daily, depending on the selected range.

Click the refresh button <Icon name="arrows-clockwise" /> in the section toolbar to manually load the latest data. The section also refreshes automatically:

- Every 30 seconds for the 5m and 15m ranges
- Every 5 minutes for the 1h, 24h and 7d ranges
