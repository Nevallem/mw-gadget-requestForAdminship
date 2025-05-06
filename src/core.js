/**
 * Creates and closes requests for adminship on pt.wikipedia
 *
 * @author [[w:pt:user:!Silent]]
 * @date 09/apr/2015
 * @update 06/may/2025
 * @see [[MediaWiki:Gadget-requestForAdminship.js]]
 * @source https://github.com/Nevallem/requestForAdminship
 */

/* jshint laxbreak: true, unused: true, -W007, esversion: 6 */
/* global mw, $ */

( function( window ) {
'use strict';

let rfa,
	api = new mw.Api();

// Messages
mw.messages.set( {
	// summary
	'rfa-summary-sufixDefault': ', usando um [[MediaWiki:Gadget-requestForAdminship.js|gadget]]',

	// alert
	'rfa-alert': 'Aviso',
	'rfa-alert-nominateHimself': 'Para nomear a si próprio, utilize o campo de autonomeação',
	'rfa-alert-cantClose': 'Apenas os burocratas podem encerrar pedidos de adminstração.',
	'rfa-alert-alreadyClosed': 'O pedido já está encerrado.',
	'rfa-alert-ownRequest': 'Você não pode fechar o seu próprio pedido.',

	// status
	'rfa-status-fail': 'Houve um problema entre as edições.',
	'rfa-status-finished': 'Finalizado',
	'rfa-status-done': 'FEITO',
	'rfa-status-error': 'ERRO',
	'rfa-status-abort': 'O processo ainda não foi finalizado, deseja sair assim mesmo?',
	'rfa-status-getContentPage': 'Obtendo o conteúdo da página "$1"',

	// buttons
	'rfa-button-OK': 'OK',
	'rfa-button-cancel': 'Cancelar',
	'rfa-button-yes': 'Sim',
	'rfa-button-no': 'Não',

	// month names
	'rfa-mothnames': 'jan fev mar abr mai jun jul ago set out nov dez',

	// create → dialog
	'rfa-create-dialog-title-0': 'Nomeação para administrador',
	'rfa-create-dialog-title-1': 'Autonomeação para administrador',
	'rfa-create-dialog-name': 'Nome do candidato: ',
	'rfa-create-dialog-argumentation-0': 'Apresente sua argumentação em prol do candidato: ',
	'rfa-create-dialog-argumentation-1': 'Apresente uma argumentação em prol da sua candidatura: ',
	'rfa-create-dialog-msgEsplanada': 'Mensagem que será enviada a Esplanada: ',
	'rfa-create-dialog-msgEsplanada-default-0': 'Anuncio a todos que nomeei o editor [[Usuário:$1|$1]] ao cargo de [[WP:Administrador|]]. ~~' + String.fromCharCode( 126 ) + '~',
	'rfa-create-dialog-msgEsplanada-default-1': 'Anuncio a todos que me auto-nomeei ao cargo de [[WP:Administrador|]]. ~~' + String.fromCharCode( 126 ) + '~',

	// create → status
	'rfa-create-status-title': 'Criando candidatura',
	'rfa-create-status-creatingPage': 'Criando página da votação',
	'rfa-create-status-listingRfA': 'Adicionando a votação na predefinição "MRNomeações"',
	'rfa-create-status-announcing': 'Anunciando a votação na Esplanada/Anúncios',
	'rfa-create-status-verifyPreviousRfA': 'Verificando se o candidato possui pedido(s) anterior(es) a esse',
	'rfa-create-status-requestList': 'Adicionando a votação na lista de pedidos',

	// create → summary
	'rfa-create-summary-creatingPage-0': 'Criação do pedido de adminstração do editor [[Usuário:$1|$1]]',
	'rfa-create-summary-creatingPage-1': 'Criação da minha autonomeação ao cargo de adminstrador',
	'rfa-create-summary-listingRfA-0': 'Adicionando o pedido de administração do editor [[Usuário:$1|$1]]',
	'rfa-create-summary-listingRfA-1': 'Adicionando minha autonomeação ao cargo de administrador',
	'rfa-create-summary-announcing-0': 'Anunciando o pedido de administração do editor [[Usuário:$1|$1]]',
	'rfa-create-summary-announcing-1': 'Anunciando a minha autonomeação ao cargo de administrador',

	// close → dialog
	'rfa-close-dialog-open': 'encerrar o pedido',
	'rfa-close-dialog-title': 'Encerramento do pedido',
	'rfa-close-dialog-result': 'Resultado da votação ',
	'rfa-close-dialog-result-1': 'Aprovado',
	'rfa-close-dialog-result-2': 'Reprovado',
	'rfa-close-dialog-result-3': 'Cancelado',
	'rfa-close-dialog-result-textarea-1': 'Comentário adicional que será incluído no topo da página (não precisa assinar)',
	'rfa-close-dialog-result-textarea-2': 'Justifique o motivo do cancelamento (não precisa assinar)',

	// close → status
	'rfa-close-status-title': 'Encerrando o pedido',
	'rfa-close-status-closing': 'Encerrando a votação',
	'rfa-close-status-updatingRfA': 'Atualizando a votação na predefinição "MRNomeações"',
	'rfa-close-status-requestListRemoving': 'Removendo a votação da lista de pedidos',
	'rfa-close-status-archiving': 'Arquivando o pedido',
	'rfa-close-status-sendMsg': 'Enviando mensagem ao editor',

	// close → summary
	'rfa-close-summary-closing': 'Encerrando a votação ($1)',
	'rfa-close-summary-updatingRfA': 'Atualizando a votação para administrador do editor "[[Usuário:$1|$1]]" ($2)',
	'rfa-close-summary-requestListRemoving': 'Removendo a votação do editor "[[Usuário:$1|$1]]" ($2)',
	'rfa-close-summary-archiving': 'Arquivando o pedido do editor "[[Usuário:$1|$1]]" ($2)',
	'rfa-close-summary-sendMsg': 'Enviando uma mensagem com a [[Predefinição:Novo administrador]]',

} );

rfa = {
	/**
	 * Messages
	 * @param {string} name Name of the message
	 * @param {string|number} [$N] Dynamic parameters to the message (i.e. the values for $1, $2, etc)
	 * @see [[mw:ResourceLoader/Default_modules#mediaWiki.message]]
	 * @return {string}
	 */
	message: function ( /*name[, $1[, $2[, ... $N ]]]*/ ) {
		return mw.message.apply( this, arguments ).plain();
	},

	/**
	 * Creates a dialog
	 *
	 * @param {jQuery.dialog} info Dialog info
	 * @param {boolean} [notClose=false] Not closes the previous dialogs
	 * @return {jQuery}
	 */
	dialog: function( info, notClose ) {
		let $rfaDialog = $( '<div class="rfa-dialog ui-widget"></div>' ).append( info.content );

		if ( $( '.rfa-dialog' ).length && !notClose ) {
			$( '.rfa-dialog' ).each( function() {
				$( this ).dialog( 'close' );
			} );
		}

		if ( !info.modal ) {
			info.modal = true;
		}

		$.extend( info, {
			open: function() {
				$( '.ui-dialog-titlebar-close' ).hide();
			},
			close: function() {
				$rfaDialog.dialog( 'destroy' ).remove();
			}
		} );

		$rfaDialog.dialog( info );
	},

	/**
	 * Alert prompt
	 *
	 * @param {string} text Text of warn
	 * @param {jQuery.dialog} [info] See "rfa.dialog"
	 * @param {boolean} [notClose=false] See "rfa.dialog"
	 */
	alert: function ( text, info, notClose ) {
		let infoDefault,
			buttons = {};

		buttons[ rfa.message( 'rfa-button-OK' ) ] = function() {
			$( this ).dialog( 'close' );
		};

		infoDefault = {
			title: rfa.message( 'rfa-alert' ),
			content: text,
			dialogClass: 'rfa-alert',
			width: 'auto',
			height: 'auto',
			buttons: buttons
		};

		if ( $.isPlainObject( info ) ) {
			$.extend( infoDefault, info );
		}

		rfa.dialog( infoDefault, notClose );
	},

	/**
	 * Edit function
	 *
	 * @param {mediaWiki.messages} status Log that will be shown in status prompt
	 * @param {object} info Edit params
	 * @return {jQuery.Deferred}
	 * @see see [[mw:API:Edit]]
	 */
	editPage: function( status, info ) {
		let apiDeferred = $.Deferred(),
			edit = function( value ) {
				rfa.status.log( status );

				if ( $.isFunction( info.text ) ) {
					info.text = info.text( value );
				}

				if ( typeof info.getText !== 'undefined' ) {
					delete info.getText;
				}

				info.watchlist = 'preferences';
				info.summary = info.summary + rfa.message( 'rfa-summary-sufixDefault' );
				info.minor = true;

				api.editPage( info ).done( function() {
					apiDeferred.resolve( value );
				} );
			};

		// If "info.text" is set and is a function, gets the page content first
		// Set "info.getText" if you need get the content of another page other than "info.title"
		if ( typeof info.getText === 'string' || $.isFunction( info.text ) ) {
			rfa.status.log( rfa.message( 'rfa-status-getContentPage', ( info.getText || info.title || mw.config.get( 'wgPageName' ).replace( /_/g, ' ' ) ) ) );
			api.getCurrentPageText( info.getText || info.title ).done( function( value ) {
				edit( value );
			} );
		} else {
			edit();
		}

		return apiDeferred.promise();
	},

	/**
	 * Forces fill a field
	 *
	 * @param {jQuery} $target
	 * @param {boolean} [condition] Condition to force fill
	 * @return {boolean}
	 */
	forceFill: function ( $target, condition ) {
		if ( ( typeof condition === 'boolean' && condition ) || $target.val() === '' ) {
			$target.addClass( 'rfa-fillField' );
		} else if ( $target.hasClass( 'rfa-fillField' ) ) {
			$target.removeClass( 'rfa-fillField' );
		}

		return ( typeof condition === 'boolean' ? !condition : $target.val() !== '' );
	},

	/**
	 * Stats edits
	 *
	 * @param {jQuery.Deferred} arguments The edits
	 * @example
		rfa.doEdits(
			rfa.editPage( info ) [,
			rfa.editPage( info ) [,
			rfa.editPage( info ) [,
			...
		] ] ] );
	 * @return {jQuery.Deferred}
	 */
	doEdits: function() {
		return $.when.apply( this, Array.prototype.slice.call( arguments, 1 ) ).fail( function() {
			rfa.status.log( rfa.message( 'rfa-status-editFail' ) );
		} );
	}
};

/* Status */
rfa.status = {};

/**
 * Writes a new log in the status prompt
 *
 * @param {mediaWiki.messages} status Text of log
 * @param {string} [errorName] Error name
 */
rfa.status.log = function( status, errorName ) {
	let log = '',
		error = ( status === 'error' );

	if ( $( '#rfa-status' ).html().lastIndexOf( '...' ) !== -1 ) {
		log += ( !error )
			? rfa.message( 'rfa-status-done' )
			: log += rfa.message( 'rfa-status-error' ) + ' (' + errorName + ')';
		log = '<b>' + log + '</b><br />';
	}

	if ( !error ) {
		log += status + ( ( status !== rfa.message( 'rfa-status-finished' ) ) ? ' ... ' : '.' );
	}

	$( '#rfa-status' ).append( log );
};

/**
 * Open the status prompt
 *
 * @param {mediaWiki.messages} title Title of prompt
 */
rfa.status.open = function( title ) {
	let buttons = {},
		cancelButton = function() {
			$( '.rfa-dialog' ).eq( 0 ).dialog( 'close' );
			$( window ).off( 'beforeunload' );
		};

	buttons[ rfa.message( 'rfa-button-cancel' ) ] = function() {
		if ( $( this ).html().lastIndexOf( rfa.message( 'rfa-status-error' ) ) !== -1 ) {
			return cancelButton();
		}

		buttons.alertButtons = {};
		buttons.alertButtons[ rfa.message( 'rfa-button-yes' ) ] = function() {
			$( this ).dialog( 'close' );
			cancelButton();
		};
		buttons.alertButtons[ rfa.message( 'rfa-button-no' ) ] = function() {
			$( this ).dialog( 'close' );
		};

		rfa.alert( rfa.message( 'rfa-status-abort' ), {
			modal: false,
			buttons: buttons.alertButtons
		}, true );
	};

	rfa.dialog( {
		title: title,
		content: '<div id="rfa-status"><div>',
		width: '700px',
		buttons: buttons
	} );
};

/* Create */
rfa.create = {};

/**
 * Verifies if already exists a RfA to this user
 *
 * @param {string} candidateName
 * @param {number} [count]
 */
rfa.create.verifyPreviousRfA = function( candidateName, count ) {
	if ( count == 1 ) {
		count++;
	}

	let page =  'Wikipédia:Administradores/Pedidos de aprovação/' + candidateName + ( !!count ? '/' + count : '' );

	if ( !count ) {
		count = 0;
		rfa.create.apiDeferred = $.Deferred();
	}

	api.getCurrentPageText( page ).done( function( value ) {
		if ( value === undefined ) {
			rfa.create.apiDeferred.resolve( count );
		} else {
			rfa.create.verifyPreviousRfA( candidateName, ++count );
		}
	} );

	return rfa.create.apiDeferred.promise();
};

/**
 * Creates a RfA
 *
 * @param {jQuery} candidateName Username
 * @param {jQuery} argumentation Argumentation to the request
 * @param {jQuery} announcement Announcement on "Esplanada"
 * @param {boolean} isNominate If is nominate or not
*/
rfa.create.run = function( candidateName, argumentation, announcement, isNominate ) {
	let candidateNameFullSufix;

	rfa.status.open( rfa.message( 'rfa-create-status-title' ) );
	rfa.status.log( rfa.message( 'rfa-create-status-verifyPreviousRfA' ) );
	rfa.create.verifyPreviousRfA( candidateName ).done( function( count ) {
		candidateNameFullSufix = candidateName + ( !count ? '' : '/' + count );

		rfa.doEdits(
			rfa.editPage( rfa.message( 'rfa-create-status-requestList' ), {
				title: 'Wikipédia:Administradores/Pedidos_de_aprovação/Lista_de_pedidos',
				text: function( text ) {
					return text.replace( /\n(\{\{nenhum}})/i, '\n<!-- $1 -->' )
						+ '\n{{Wikipédia:Administradores/Pedidos de aprovação/' + candidateNameFullSufix + '}' + '}';
				},
				summary: rfa.message( 'rfa-create-summary-listingRfA-' + +!isNominate, candidateName )
			} ),
			rfa.editPage( rfa.message( 'rfa-create-status-announcing' ), {
				title: 'Wikipédia:Esplanada/anúncios',
				section: 'new',
				sectiontitle: '[[Wikipédia:Administradores/Pedidos de aprovação/' + candidateNameFullSufix + ']]',
				text: announcement,
				summary: rfa.message( 'rfa-create-summary-announcing-' + +!isNominate, candidateName )
			} ),
			rfa.editPage( rfa.message( 'rfa-create-status-listingRfA' ), {
				title: 'Predefinição:MRNomeações',
				text: function( text ) {
					text = text
						.replace( /(\|AdministradorAbertosTexto ?= ?\n?)(\* ?\{\{nenhum\}\})/i, '$1<!-- $2 -->' )
						.replace(
							/\|AdministradorAbertosTotal ?= ?(\d+)/,
							function( $1, $2 ) {
								return '|AdministradorAbertosTotal=' + ( parseInt( $2 ) + 1 );
							}
						);

					text = text.replace( /(\|AdministradorConcluídosTotal= ?)/, '* [[Wikipédia:Administradores/Pedidos de aprovação/' + candidateNameFullSufix + '|' + candidateName + ']]\n$1' );

					return text;
				},
				summary: rfa.message( 'rfa-create-summary-listingRfA-' + +!isNominate, candidateName )
			} ),
			rfa.editPage( rfa.message( 'rfa-create-status-creatingPage' ), {
				getText: 'Predefinição:PA' + ( isNominate + 1 ),
				title: 'Wikipédia:Administradores/Pedidos de aprovação/' + candidateNameFullSufix,
				text: function( text ) {
					return text
						.replace( /<\/?includeonly>/g, '' )
						.replace( /<!-- Apague .+-->/, argumentation );
				},
				summary: rfa.message( 'rfa-create-summary-creatingPage-' + +!isNominate, candidateName )
			} )
		).done( function() {
			rfa.status.log( rfa.message( 'rfa-status-finished' ) );
			$( window ).off( 'beforeunload' );
			location.href = mw.util.getUrl( 'Wikipédia:Administradores/Pedidos de aprovação/' + candidateNameFullSufix, ( !isNominate ? { action: 'edit' } : {} ) );
		} );
	} );
};

/**
 * Init
 */
rfa.create.init = function() {
	let isNominate,
		buttons = {},
		$createButton = $( 'input[name="create"]' );

	$createButton.eq( 0 ).attr( 'id', 'rfa-create-dialog-self' );
	$createButton.eq( 1 ).attr( 'id', 'rfa-create-dialog-nominate' );
	$( '#rfa-create-dialog-self' ).prev().prev().find( 'input' )
		.val( mw.config.get( 'wgUserName' ).replace( /_/, '' ) )
		.trigger( 'keyup' ); // enables the button

	buttons[ rfa.message( 'rfa-button-OK' ) ] = function() {
		rfa.forceFill( $( '#rfa-create-dialog-name' ) );
		rfa.forceFill( $( '#rfa-create-dialog-argumentation' ) );
		rfa.forceFill( $( '#rfa-create-dialog-msgEsplanada' ) );

		if ( $( '.rfa-dialog *' ).hasClass( 'rfa-fill-field' ) ) {
			return;
		}

		if ( isNominate && $( '#rfa-create-dialog-name' ).val() === mw.config.get( 'wgUserName' ).replace( /_/, '' ) ) {
			rfa.alert( rfa.message( 'rfa-alert-nominateHimself' ), {}, true );
			return;
		}

		rfa.create.run( $( '#rfa-create-dialog-name' ).val(), $( '#rfa-create-dialog-argumentation' ).val(), $( '#rfa-create-dialog-msgEsplanada' ).val(), isNominate );
	};

	buttons[ rfa.message( 'rfa-button-cancel' ) ] = function() {
		$( this ).dialog( 'close' );
	};

	$createButton.click( function( e ) {
		e.preventDefault();

		isNominate = $( this ).attr( 'id' ) === 'rfa-create-dialog-nominate';

		rfa.dialog( {
			title: rfa.message( 'rfa-create-dialog-title-' + +!isNominate ),
			content: '<label>' + rfa.message( 'rfa-create-dialog-name' ) + '<input id="rfa-create-dialog-name" /></label>'
				+ '<br /><label>' + rfa.message( 'rfa-create-dialog-argumentation-' + +!isNominate ) + '<br /><textarea id="rfa-create-dialog-argumentation" style="height:150px"></textarea></label>'
				+ '<br /><label>' + rfa.message( 'rfa-create-dialog-msgEsplanada' ) + '<br /><textarea id="rfa-create-dialog-msgEsplanada" style="height:75px"></textarea></label>',
			height: 450,
			width: 700,
			buttons: buttons
		} );

		$( '#rfa-create-dialog-name' ).val( $( 'input[name="title"]' ).eq( +!!isNominate ).val() );
		$( '#rfa-create-dialog-msgEsplanada' ).val( rfa.message( 'rfa-create-dialog-msgEsplanada-default-' + +!isNominate, $( '#rfa-create-dialog-name' ).val() ) );
	} );
};

/* Close */
rfa.close = {};

/**
 * Closes the RfA
 *
 * @param {string} result Possible values is "Aprovado", "Reprovado" or "Cancelado"
 * @param {string} commentary Aditional commentary on top of RfA page
 * @param {string} candidateNameFullSufix ex: User_name/1
 * @param {string} candidateName Username
 */
rfa.close.run = function( result, commentary, candidateNameFullSufix, candidateName ) {
	let rfaText;

	rfa.status.open( rfa.message( 'rfa-close-status-title' ) );
	rfa.doEdits(
		rfa.editPage( rfa.message( 'rfa-close-status-closing' ), {
			title: 'Wikipédia:Administradores/Pedidos de aprovação/' + candidateNameFullSufix,
			text: function( text ) {
				rfaText = text;

				return text
					.replace( /(^\{\{Wikipédia:.+)data=.+(}})/, '$1' + result.toLowerCase() + '$2\n\n\{\{Início destaque}}\n' + commentary + ' ~~' + String.fromCharCode( 126 ) + '~\n\{\{Fim destaque}}' )
					.replace( /<!-- ?({{Wikipédia:.+}}) ?-->/, '$1' );
			},
			summary: rfa.message( 'rfa-close-summary-closing', result )
		} ),
		rfa.editPage( rfa.message( 'rfa-close-status-updatingRfA' ), {
			title: 'Predefinição:MRNomeações',
			text: function( text ) {
				let rfaLink = '* [[Wikipédia:Administradores/Pedidos de aprovação/' + candidateNameFullSufix + '|' + candidateName + ']]';

				text = text
					.replace( rfaLink + '\n', '' )
					.replace( /(\|AdministradorConcluídosTexto ?= ?\n?)(\* ?\{\{nenhum\}\})/i, '$1<!-- $2 -->' )
					.replace( /(<\!\-\- BUROCRATA  \-\-\>)/, rfaLink + ' {{MRImagem|' + result.toLowerCase() + '}' + '}\n$1' )
					.replace(
						/\|AdministradorAbertosTotal ?= ?(\d+)/,
						function( $1, $2 ) {
							return '|AdministradorAbertosTotal=' + ( parseInt( $2 ) - 1 );
						}
					)
					.replace(
						/\|AdministradorConcluídosTotal ?= ?(\d+)/,
						function( $1, $2 ) {
							return '|AdministradorConcluídosTotal=' + ( parseInt( $2 ) + 1 );
						}
					);

				if ( /\|AdministradorAbertosTotal ?= ?(\d+)/.exec( text )[ 1 ] === '0' ) {
					text = text.replace( /(\|AdministradorAbertosTexto ?= ?\n?)<\!\-\- ?(\* ?\{\{nenhum\}\}) ?\-\-\>/i, '$1$2' );
				}

				return text;
			},
			summary: rfa.message( 'rfa-close-summary-updatingRfA', candidateName, result )
		} ),
		rfa.editPage( rfa.message( 'rfa-close-status-requestListRemoving' ), {
			title: 'Wikipédia:Administradores/Pedidos_de_aprovação/Lista_de_pedidos',
			text: function( text ) {
				text = text.replace( '\n{{Wikipédia:Administradores/Pedidos de aprovação/' + candidateNameFullSufix + '}' + '}', '' );

				if ( text.search( '{{Wikipédia:' ) === -1 ) {
					text = text.replace( /\n<\!\-\- ?(\{\{nenhum}}) ?\-\-\>/i, '\n$1' );
				}

				return text;
			},
			summary: rfa.message( 'rfa-close-summary-requestListRemoving', candidateName, result )
		} )
	).done( function() {
		let currentDate = new Date();

		rfa.editPage( rfa.message( 'rfa-close-status-archiving' ), {
			title: 'Wikipédia:Administradores/Pedidos de aprovação/Arquivo/' + currentDate.getFullYear(),
			section: { 'Aprovado': 1, 'Reprovado': 2, 'Cancelado': 3 }[ result ],
			text: function( text ) {
				let sectionContent,
					archiveTemplate = { 'Aprovado': 'Aprovo', 'Reprovado': 'Não aprovo', 'Cancelado': 'Cancelado' }[ result ],
					refreshPage = function() {
						rfa.status.log( rfa.message( 'rfa-status-finished' ) );
						$( window ).off( 'beforeunload' );
						location.href = mw.util.getUrl( 'Wikipédia:Administradores/Pedidos de aprovação/' + candidateNameFullSufix );
					}
					/*rfaLink = /Wikipédia:Administradores\/Pedidos de aprovação\/.+\|([^\]]+)/*/;

				if ( result === 'Aprovado' ) {
					sectionContent = text.substring( text.indexOf( '== Aprovados ==\n' ) + 16, text.indexOf( '\n== Reprovados ==' ) - 1 );
				} else if ( result === 'Reprovado' ) {
					sectionContent = text.substring( text.indexOf( '== Reprovados ==\n' ) + 17, text.indexOf( '\n== Cancelados ==' ) - 1 );
				} else {
					sectionContent = text.substring( text.indexOf( '== Cancelados ==\n' ) + 17, text.indexOf( '\n[[Categoria:' ) - 1 );
				}

				sectionContent += '\n\n\{\{' + archiveTemplate + '|<small>' + [
						currentDate.getDate(),
						rfa.message( 'rfa-mothnames' ).split( ' ' )[ currentDate.getMonth() ],
						currentDate.getFullYear()
					].join( '/' ) + '</small>}} - [[Wikipédia:Administradores/Pedidos de aprovação/' + candidateNameFullSufix + '|' + candidateName + ']]';

				if ( result !== 'Cancelado' ) {
					sectionContent += ' - (<small>Votos: ' + ( /(==== ?A favor ?====(.|\n)*)(?=\==== ?Contra ?====)/.exec( rfaText )[ 0 ].split( /\n#[^:\n]/ ).length - 1 )
						+ '/' + ( /(==== ?Contra ?====(.|\n)*)(?=\==== ?Abstenções ?====)/.exec( rfaText )[ 0 ].split( /\n#[^:\n]/ ).length - 1 )
						+ '/' + ( /(==== ?Abstenções ?====(.|\n)*)(?=\=== ?Comentários ?===)/.exec( rfaText )[ 0 ].split( /\n#[^:\n]/ ).length - 1 )
					+ '</small>)';

					text = text.replace( new RegExp( '(\n|.)*(== ?' + result + 's ?==\n)(\n|.)+' ), '$2' + sectionContent/*.split( '\n' ).sort( function( x, y ) {
						return ( x === '' || y === '' ) ? true : rfaLink.exec( y )[ 1 ].toLowerCase() < rfaLink.exec( x )[ 1 ].toLowerCase();
					} ).join( '\n' )*/ );

					rfa.editPage( rfa.message( 'rfa-close-status-sendMsg' ), {
						title: 'User talk:' + candidateName,
						appendtext: '\n{{subst:Novo administrador}' + '}',
						summary: rfa.message( 'rfa-close-summary-sendMsg' )
					} ).done( refreshPage );
				} else {
					text = text.replace( new RegExp( '(\n|.)+(== ?' + result + 's ?==\n)(\n|.)+' ), '$2' + sectionContent + text.substring( text.indexOf( '\n[[Categoria:' ) - 1 ) );
					refreshPage();
				}

				return text;
			},
			summary: rfa.message( 'rfa-close-summary-archiving', candidateName, result )
		} );
	} );
};

/**
 * Init
 */
rfa.close.init = function() {
	let buttons = {},
		candidateNameFullSufix = mw.config.get( 'wgPageName' ).replace( /Wikipédia:Administradores\/Pedidos_de_aprovação\//, '' ),
		candidateName = candidateNameFullSufix.split( '/' )[ 0 ];

	$( 'h2' ).eq( 1 ).find( 'a' ).after( '<small> | <a id="rfa-close-dialog-open">' + rfa.message( 'rfa-close-dialog-open' ) + '</a></small>' );

	buttons[ rfa.message( 'rfa-button-OK' ) ] = function() {
		if ( $( '#rfa-close-dialog-result' ).val() === '3' && !rfa.forceFill( $( '#rfa-close-dialog-result-textarea' ) ) ) {
			return;
		}

		rfa.close.run( $( '#rfa-close-dialog-result option:selected' ).text(), $( '#rfa-close-dialog-result-textarea' ).val(), candidateNameFullSufix, candidateName );
	};

	buttons[ rfa.message( 'rfa-button-cancel' ) ] = function() {
		$( this ).dialog( 'close' );
	};

	$( '#rfa-close-dialog-open' ).click( function() {
		if ( $( '#mw-content-text' ).text().search( 'Por favor, não o modifique' ) !== -1 ) {
			rfa.alert( rfa.message( 'rfa-alert-alreadyClosed' ) );
			return;
		}

		if ( mw.config.get( 'wgUserName' ) === candidateName ) {
			rfa.alert( rfa.message( 'rfa-alert-ownRequest' ) );
			return;
		}

		rfa.dialog( {
			title: rfa.message( 'rfa-close-dialog-title' ),
			content: '<label>' + rfa.message( 'rfa-close-dialog-result' ) + ' <select id="rfa-close-dialog-result">'
				+ '<option value="1">' + rfa.message( 'rfa-close-dialog-result-1' ) + '</option>'
				+ '<option value="2">' + rfa.message( 'rfa-close-dialog-result-2' ) + '</option>'
				+ '<option value="3">' + rfa.message( 'rfa-close-dialog-result-3' ) + '</option>'
			+ '</select></label>'
			+ '<textarea id="rfa-close-dialog-result-textarea" placeholder="' + rfa.message( 'rfa-close-dialog-result-textarea-1' ) + '"></textarea>',
			width: 'auto',
			buttons: buttons
		} );

		$( '#rfa-close-dialog-result' ).change( function() {
			if ( $( this ).val() !== '3' ) {
				$( '#rfa-close-dialog-result-textarea' )
					.removeClass( 'rfa-fillField' )
					.attr( 'placeholder', rfa.message( 'rfa-close-dialog-result-textarea-1' ) );
			} else {
				$( '#rfa-close-dialog-result-textarea' ).attr( 'placeholder', rfa.message( 'rfa-close-dialog-result-textarea-2' ) );
			}
		} );
	} );
};

if ( mw.config.get( 'wgPageName' ) === 'Wikipédia:Administradores/Pedidos_de_aprovação' ) {
	$( rfa.create.init );
} else if ( mw.config.get( 'wgPageName' ).indexOf( 'Wikipédia:Administradores/Pedidos_de_aprovação/' ) !== -1 && $.inArray( mw.config.get( 'wgUserGroups' ), 'bureaucrat' ) !== -1 ) {
	$( rfa.close.init );
}

window.rfa = rfa;

}( window ) );
