/**
 * Creates and closes requests for adminship in pt.wikipedia
 *
 * @author [[w:pt:user:!Silent]]
 * @date 09/apr/2015
 * @update 24/oct/2017
 * @see [[MediaWiki:Gadget-requestForAdminship.js]]
 */

/* global mw */

( function () {
'use strict';

if ( mw.config.get( 'wgPageName' ) === 'Wikipédia:Administradores/Pedidos_de_aprovação'
	||  mw.config.get( 'wgPageName' ).indexOf( 'Wikipédia:Administradores/Pedidos_de_aprovação/' ) !== -1
) {
	mw.loader.load( 'ext.gadget.requestForAdminshipCore' );
}

}() );