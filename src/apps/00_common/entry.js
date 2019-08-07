import '~extensions';
import vueCommon from '~bpa-vue/common.js';
import helpers from '~bpa-js/helpers';
import hotReload from '~bpa-js/hot-reload';
import vueSetup from '~bpa-js/vue-setup';
import store from '~vue/store.js';
import vueApp from '~vue/app.vue';
import { CLIENT_EVENTS } from '~constants';

$$$.io = io();

$$$( () => {
    if ( ENV.isDev ) hotReload();

    $$$.vue = vueSetup.init( {
        store: store,
        app: vueApp,
        components: [vueCommon.ui, vueApp.components]
    } );
    
    $$$.emit( CLIENT_EVENTS.READY );

    $$$.app = $$$.vue.$app;
    $$$.app.main();
} );