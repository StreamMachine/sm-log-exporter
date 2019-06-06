#!/bin/sh

./runner-cmd --debug=1 --server $ELASTICSEARCH_SERVER --index streammachine-hls --start $START_DATE --end $END_DATE --min_duration 60 --max_duration 86400 --format soundexchange > /reports/$OUTPUT_FILE