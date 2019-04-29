testCase( 'Demo test', {
    'init -- isTrue'() { assert.isTrue( true, 'Test true' ); },

    'GET::/test -- Contains the word "test"'( data ) { assert.isTrue( data.has( 'test' ) ); },
} )