# sudo docker rm -f $(sudo docker ps -q) ;
sudo docker rm -f grafana-plugin-dev ;
sudo docker run -p 3001:3000 --user $(id -u) --name grafana-plugin-dev \
--volume $(pwd)/dist:/var/lib/grafana/plugins/test-plugin \
--volume /home/hjchoi/__yt/gf_plugin.template_view/dist:/var/lib/grafana/plugins/template-view \
--volume $(pwd)/grafana.ini.proxy_log:/etc/grafana/grafana.ini \
--volume $(pwd)/grafana.db.7.5.3:/var/lib/grafana/grafana.db \
whyit/grafana:7.5.3.0
# --volume $(pwd)/grafana.db.6.4:/var/lib/grafana/grafana.db \
# ironcpa/grafana-arcus
# --volume /home/hjchoi/__system/grafana.db:/var/lib/grafana/grafana.db \
# --volume /home/hjchoi/__system/grafana.ini:/etc/grafana/grafana.ini \
# grafana/grafana:6.3.6
# grafana/grafana &&
# firefox localhost:3000
