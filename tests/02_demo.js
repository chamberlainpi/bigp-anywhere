testCase( 'Demo test', {
    'init'() { assert.isTrue( true, 'Test true' ); },

    'GET::/test -- Contains the word "test"'( data ) { assert.isTrue( data.has( 'test' ) ); },
} )