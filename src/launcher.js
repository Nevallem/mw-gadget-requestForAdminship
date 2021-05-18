/**
 * Creates and closes requests for adminship in pt.wikipedia
 *
 * @author [[w:pt:user:!Silent]]
 * @date 09/apr/2015
 * @update 18/mai/2021
 */
/* jshint laxbreak: true */
/* global mw */

( function () {
'use strict';

// Anonymous user
if ( !mw.config.get( 'wgUserName' ) ) {
	return;
}

if ( mw.config.get( 'wgPageName' ) === 'Wikipédia:Administradores/Pedidos_de_aprovação'
	||  mw.config.get( 'wgPageName' ).indexOf( 'Wikipédia:Administradores/Pedidos_de_aprovação/' ) !== -1
) {
	mw.loader.load( 'ext.gadget.requestForAdminshipCore' );
}

}() );
