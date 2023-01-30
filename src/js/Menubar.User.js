import * as THREE from '../three.module.js';

import {UIPanel, UIText, UIInput, UIRow, UIButton} from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';

function MenubarUser( editor ) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu user right' );

	// Username input
	const usernameInput = new UIInput("").setId("usernameInput")
											  .setPlaceholder("Your username")
											  .addClass('usernameInput')
											  .onChange( function () {

			  this.dom.blur(); // removes focus

			  // Change UI status
			  this.dom.classList.add("userPendingLoggedIn");

			  // Send to server
		 	  editor.socket.emit('requestUserNameChange', this.dom.value);
	} );

	container.add( usernameInput );

	// Button to show users
	const openListUsersBt = new UIButton( '');
	openListUsersBt.dom.innerHTML = '<span class="material-symbols-outlined">list</span>';
	openListUsersBt.setClass("openListUsers")
	openListUsersBt.onClick( () => {

		openListUsersBt.setEnabled(false);

		editor.socket.emit('requestAllUserNames');

		editor.socket.once('allUsers', (clients) => {

			// Get Data
			let list_data =[];

			Object.values(clients).forEach( item =>{
				list_data.push(item.customName);
			});

			// Add Modal
			let userListDiv = document.createElement("div");
			userListDiv.id = "userListDiv";
			userListDiv.className = "modalUserList";
			userListDiv.innerHTML = `<span class="closeModalUserList">&times;</span><ol id="userList" class="userList"></ol>`;
			userListDiv.style.display = "block";

			console.log("userListDiv", userListDiv);

			container.dom.appendChild(userListDiv);

			// Get the <span> element that closes the modal
			let span = userListDiv.getElementsByClassName("closeModalUserList")[0];


			let list = document.getElementById("userList");

			list_data.forEach((item) => {
				let li = document.createElement("li");
				let href = document.createElement("a");
				href.innerText = item;
				li.append(href);
				list.appendChild(li);
			});


			// When the user clicks on <span> (x), close the modal
			span.onclick = function() {
				document.getElementById("userList").replaceChildren();
				document.getElementById("userListDiv").remove();
				openListUsersBt.setEnabled(true);


			}
		});
	} );
	container.add( openListUsersBt );

	return container;
}

export { MenubarUser };
