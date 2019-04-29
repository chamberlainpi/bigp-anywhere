import '~extensions';
import vueCommonUI from '~bpa-vue/common.js';
import helpers from '~bpa-js/helpers';
import hotReload from '~bpa-js/hot-reload';
import vueSetup from '~bpa-js/vue-setup';
import vueApp from '~bpa-app/app.vue';
import { ENODEV } from 'constants';

$$$.io = io();

$$$( () => {
    if ( ENV.isDev ) {
        hotReload();
    }

    vueSetup.init( {
        app: vueApp,
        components: vueCommonUI.ui
    });
})

//trace( "HEllo World!!!" );