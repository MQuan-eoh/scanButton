# E-Ra Widget
Library to create E-Ra widget

## Installation
```bash
npm install @eohjsc/era-widget
```
```bash
yarn add @eohjsc/era-widget
```
```html
<script src="https://www.unpkg.com/@eohjsc/era-widget@1.1.1/src/index.js"></script>
```
## Usage
```javascript
import eraWidget from '@eohjsc/era-widget';
```
```javascript
eraWidget.init({
  onConfiguration: (configuration) => {
    console.log('configuration', configuration);
  },
  onHistory: (history) => {
    console.log('history', history);
  },
  onValues: (values) => {
    console.log('values', values);
  },
});


// call when need to request history
eraWidget.requestHistories(startTime, endTime);
```
## Options
| Name                    | Type     | Default | Description                                         |
|-------------------------|----------|---------|-----------------------------------------------------|
| onConfiguration         | Function | null    | Callback function when configuration is received    |
| onHistory               | Function | null    | Callback function when history is received          |
| onValues                | Function | null    | Callback function when values are received          |
| ready                   | boolean  | true    | Auto send ready message after initializing          |
| mobileHeight            | number   | 300     | Height of widget on mobile                          |
| needRealtimeConfigs     | boolean  | true    | Need realtime configs                               |
| needHistoryConfigs      | boolean  | true    | Need history configs                                |
| needActions             | boolean  | true    | Need actions                                        |
| maxRealtimeConfigsCount | number   | 0       | Maximum number of realtime configs (0 is unlimited) |
| maxHistoryConfigsCount  | number   | 0       | Maximum number of history configs (0 is unlimited)  |
| maxActionsCount         | number   | 0       | Maximum number of actions (0 is unlimited)          |
| minRealtimeConfigsCount | number   | 0       | Minimum number of realtime configs                  |
| minHistoryConfigsCount  | number   | 0       | Minimum number of history configs                   |
| minActionsCount         | number   | 0       | Minimum number of actions                           |

## Methods
| Name                                                                | Description                     |
|---------------------------------------------------------------------|---------------------------------|
| requestAdjustMobileHeight(height: integer)                          | Request to adjust mobile height |
| ready()                                                             | Send ready message              |
| requestHistories(start: datetime, end:datetime)                     | Request histories               |
| triggerAction(actionKey: uuid4, actionIndex: integer, data: object) | Trigger action                  |

## Attributes
| Name          | Description          | Example                                                  |
|---------------|----------------------|----------------------------------------------------------|
| configuration | Widget configuration | ```{url, realtime_configs, history_configs, actions }``` |

## Events
| Name          | Description           | Example                                                                                                                                   |
|---------------|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| configuration | widget configuration  | ```{url, realtime_configs : [ { name, color, sensor_id, chip_id, id } ], history_configs: [ { name, color, sensor_id, chip_id, id } ]}``` |
| values        | realtime config value | ```{ 1 : {value: 2} }```                                                                                                                  |
| histories     | history data          | ```[{data: [{x, y}], name, color, sensor_id, chip_id, id }]```                                                                            |
