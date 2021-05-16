# Grafana Data Source Plugin Template

[![Build](https://github.com/grafana/grafana-starter-datasource/workflows/CI/badge.svg)](https://github.com/grafana/grafana-starter-datasource/actions?query=workflow%3A%22CI%22)

This template is a starting point for building Grafana Data Source Plugins

## What is Grafana Data Source Plugin?

Grafana supports a wide range of data sources, including Prometheus, MySQL, and even Datadog. There’s a good chance you can already visualize metrics from the systems you have set up. In some cases, though, you already have an in-house metrics solution that you’d like to add to your Grafana dashboards. Grafana Data Source Plugins enables integrating such solutions with Grafana.

## Getting started

1. Install dependencies

   ```bash
   yarn install
   ```

2. Build plugin in development mode or run in watch mode

   ```bash
   yarn dev
   ```

   or

   ```bash
   yarn watch
   ```

3. Build plugin in production mode

   ```bash
   yarn build
   ```

## Learn more

- [Build a data source plugin tutorial](https://grafana.com/tutorials/build-a-data-source-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/) - Grafana Tutorials are step-by-step guides that help you make the most of Grafana
- [Grafana UI Library](https://developers.grafana.com/ui) - UI components to help you build interfaces using Grafana Design System

# Whyit Node by hj.choi

## diff from gf_plugin.ds-elasticsearch(v6)

- 대부분 v6 버전과 그대로 호환되나 QueryEditor에 사용되던 PanelOptionGroup 컴포넌트가 에러 없이 빌드되지만 실행에 문제가 있었음
- 위 컴포넌트 제외한 것 외엔 큰 변경점은 없는 것으로 보임
- 현재 query 처리 로직은 v6 코드와 동일하며 async 대신 promise 객체 리턴하는 방식 그대로 사용 중. 동작은 잘 됨
  - test 함수는 async 로 변경했으나 메인 query 함수는 v6 와 같이 promise 리턴 형태임