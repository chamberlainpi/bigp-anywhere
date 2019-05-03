/**
 * Created by Chamberlain on 4/4/2018.
 */
const EVENTS = require( '~constants' ).EVENTS;

export default function SELF() {
	const LIMIT = 2;
	const TIME_MS = 2000;

	SELF._reattempts = 0;
	SELF._autoOpenID = setInterval( () => {
		clearInterval( SELF._autoOpenID ); ///////////// <----------
		return;

		const body = document.body;

		if(SELF._reattempts>=LIMIT) {
			if(SELF._reattempts===LIMIT) traceError("Too many reattempts: " + LIMIT);
			return;
		}

		$.get({
			url: '/auto-open-check',
			success(data) {
				if(SELF._reattempts>0) {
					trace('[SOCKET.IO] Reconnecting...');
					$$$.io.connect();
				}
				SELF._reattempts = 0;
				TweenMax.to(body, 0.8, {alpha:1.0, scale:1.0, ease: Sine.easeOut});
			},
			error(err) {
				SELF._reattempts++;
				TweenMax.to(body, 0.8, {alpha:0.2, scale:0.9, ease: Sine.easeInOut});
			}
		});
	}, TIME_MS);

	if ( $$$.io ) {
		trace( "Setting up socket.io 'file-changed' event." );

		$$$.io.on( EVENTS.FILE_CHANGED, file => {
			const ext = ( file || '' ).ext();
			trace( "Changed: " + file );

			switch ( ext ) {
				case 'vue': trace( "Vue file changed: " + file ); break;
				case 'css':
					$( 'link[hot-reload]' ).each( ( i, link ) => {
						link.href = link.href.split( '?' )[0] + "?id=" + $$$.randID();
					} );

					$$$.emit( EVENTS.STYLE_CHANGED );
					break;
				case 'html':
				case 'js':
					$$$.emit( EVENTS.FORCE_RELOAD );
					break;

				case 'scss':
				case 'sass':
				case 'silent-types': break;
				default:
					trace( "Another type changed: " + file );
					break;
			}
		} );
	}


	$$$.on( EVENTS.FORCE_RELOAD, () => {
		trace( "Force Reloading..." );

		setTimeout( () => {
			window.location.reload( true );
		}, 300 );
	} );

	return SELF;
}