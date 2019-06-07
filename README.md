# sm-log-exporter

Export [StreamMachine](https://github.com/StreamMachine/StreamMachine) session
logs from Elasticsearch as W3C or SoundExchange files, for importing to
external analytics systems.

## Prereqs

* Node.js (~0.10)
* HTTP access to the Elasticsearch server with SM logs


## Docker
To run this in a container:


`docker run -it scprdev/sm-log-exporter:1.0.0 /bin/sh`

### for sound exchange reports
In a shell in this newly started container, run:
`ELASTICSEARCH_SERVER='https://your.elasticsearch.server:PORT_NUMBER' OUTPUT_FILE='sound_exchange.txt' START_DATE='2019-05-20' END_DATE='2019-06-01' ./create-soundexchange-logs.sh`

The above will create a file in `/reports/sound_exchange.txt`

### for w3c (triton) reports
`ELASTICSEARCH_SERVER='https://your.elasticsearch.server:PORT_NUMBER' ELASTICSEARCH_INDEX='some-index' node export_w3c_day_log.js`

The above will create a file as `/reports/kpcc-w3c-.*.log`