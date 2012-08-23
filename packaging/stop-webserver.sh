bin=`dirname "$0"`
bin=`cd "$bin"; pwd`
. "$bin"/chorus-config.sh

log_inline "stopping nginx "
cd $CHORUS_HOME/vendor/nginx/nginx_dist/
./$NGINX -s stop &>/dev/null
wait_for_stop $NGINX_PID_FILE
cd $CHORUS_HOME

case $RAILS_ENV in
    development )
        log_inline "stopping mizuno "
        mizuno --stop --pidfile $MIZUNO_PID_FILE &>/dev/null
        wait_for_stop $MIZUNO_PID_FILE
        ;;
    * )
        log_inline "stopping jetty "
        vendor/jetty/jetty-init stop &>/dev/null
        wait_for_stop $JETTY_PID_FILE
        ;;
esac