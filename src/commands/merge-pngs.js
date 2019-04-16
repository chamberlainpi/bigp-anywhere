let fs;

module.exports = {
    help: ``,

    exec() {
        fs = $$$.fs;

        fs.readdir( $$$.paths.root )
            .then( paths => {
                paths = paths.map( p => $$$.paths.root.mustEndWith( '/' ) + p );
                
                const dirsOnly = paths.filter( p => fs.lstatSync( p ).isDirectory() );

                const dirTextPNGs = dirsOnly.map( dir => {
                    return $$$.filterFiles( dir, /\/text[0-9a-z]*\.png/gi, true )
                } )
                
                return Promise.all( dirTextPNGs );
            } )
            .then( ads => {
                const renames = [];
                const textPNG = "/text.png";
                const text1PNG = "/text1.png";
                const before = ads.length;

                ads = ads.filter( pngs => {
                    if ( pngs.length == 0 ) return false;
                    if ( pngs.length == 1 && pngs[0].has( textPNG ) ) return false;
                    return true;
                } );

                trace( "Before: " + before + " after: " + ads.length );

                ads.forEach( pngs => {
                    const oldName = pngs[0];
                    if ( pngs.length == 1 && oldName.has( text1PNG ) ) {
                        
                        const newName = oldName.replace( 'text1', 'text' );
                        //trace( oldName.split( '/' ).pop() + " -> " + newName.split( '/' ).pop() );
                        renames.push( fs.rename( oldName, newName ) );
                    }
                } )
                
                if ( renames.length == 0 ) return [];
                return Promise.all( renames );
            } )
            .then( results => {
                trace( "Done renaming: " + results.length );
            } );
    }
};

/*
  magick -page +0+0 text1.png -page +0+0 text2.png -page +0+0 text3.png -background transparent -layers merge +repage text.png
*/