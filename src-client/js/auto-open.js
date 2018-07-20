/**
 * Created by Chamberlain on 4/4/2018.
 */

const LIMIT = 20;
const TIME_MS = 2000;

export default function SELF() {
	SELF._reattempts = 0;
	SELF.autoOpenID = setInterval(() => {
		const body = document.body;

		if(SELF._reattempts>=LIMIT) {
			if(SELF._reattempts===LIMIT) traceError("Too many reattempts: " + LIMIT);
			return;
		}

		$.get({
			url: '/auto-open-check',
			success: data => {
				if(SELF._reattempts>0) {
					trace('[SOCKET.IO] Reconnecting...');
					$$$.io.connect(); //() => trace('[socket.io] Reconnected!')
				}
				SELF._reattempts = 0;
				TweenMax.to(body, 0.8, {alpha:1.0, scale:1.0, ease: Sine.easeOut});
			},
			error: err => {
				SELF._reattempts++;
				TweenMax.to(body, 0.8, {alpha:0.2, scale:0.9, ease: Sine.easeInOut});
			}
		});
	}, TIME_MS);

	$$$.io.on('file-changed', file => {
		const ext = (file || '').ext();

		switch(ext) {
			case 'vue': trace("Vue file changed: " + file); break;
			case 'css':
				$('link[hot-reload]').each((i, link) => {
					link.href = link.href.split('?')[0] + "?id=" + $$$.randID();
				});

				$$$.emit('style-changed');
				break;
			case 'html':
			case 'js':
				$$$.emit('force-reload');
				break;

			case 'scss':
			case 'sass':
			case 'silent-types': break;
			default:
				trace("Another type changed: " + file);
				break;
		}
	});

	$$$.onLater('force-reload', 100, () => {
		window.location.reload(true);
	});

	return SELF;
}