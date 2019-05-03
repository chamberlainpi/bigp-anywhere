import '~extensions';
import vueCommon from '~bpa-vue/common.js';
import helpers from '~bpa-js/helpers';
import hotReload from '~bpa-js/hot-reload';
import vueSetup from '~bpa-js/vue-setup';
import vueApp from '~app/app.vue';
import vueComponents from '~app/components.js';
import { CLIENT_EVENTS } from '~constants';

$$$.io = io();

$$$( () => {
    if ( ENV.isDev ) {
        hotReload();
    }

    vueSetup.init( {
        app: vueApp,
        components: [vueCommon.ui, vueComponents]
    } );
    
    $$$.emit( CLIENT_EVENTS.READY );
} );