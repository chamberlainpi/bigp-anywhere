testCase( 'Default test', {
    'init'() { assert.isTrue( true, 'Test true' ); },

    'GET::/count -- Count should be 0'( count ) { assert.equal( count, 0 ); },
    'GET::/count -- Count should be 1'( count ) { assert.equal( count, 1 ); },
    'GET::/count -- Count should be 2'( count ) { assert.equal( count, 2 ); },

    'GET::/test -- Contains the word "test"'( data ) { assert.isTrue( data.has( 'test' ) ); },
})