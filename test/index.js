import '@aegisjsproject/trusted-types';
import '@aegisjsproject/sanitizer';

trustedTypes.createPolicy('default', {
	createHTML(input, sanitizer) {
		const el = document.createElement('div');
		el.setHTML(input, sanitizer);
		return el.innerHTML;
	}
});

Promise.all([
	new CSSStyleSheet().replace(`body {
		display: grid;
		grid-template-areas: "header header" "nav nav" "main sidebar" "footer footer";
		grid-template-rows: calc(100dvh - 3rem) 3rem minmax(80dvh, 600px) 45vh;
		grid-template-columns: auto 450px;
		margin: 0;
	}

	#header {
		grid-area: header;
	}

	#nav {
		grid-area: nav;
		position: sticky;
		top: 0;
		background-color: #1953ac;
		color: #fafafa;
	}

	#main {
		grdi-area: main;
	}

	#sidebar {
		grid-area: sidebar;
	}

	#footer {
		grid-area: footer;
	}`),
	new CSSStyleSheet({ media: '(max-width: 800px)' }).replace(`body {
		grid-template-areas: "header" "nav" "main" "sidebar" "footer";
		grid-template-columns: auto;
	}`),
]).then(sheets => {
	const formId = 'htmlForm';
	document.adoptedStyleSheets = sheets;
	document.body.innerHTML = `<header id="header">
		<h1>AegisJSProject Trusted Types Polyfill</h1>
	</header>
	<nav id="nav">
		<a href="javascript:alert('javascript:')"><code>javascript:</code> Link</a>
		<button type="button" onclick="alert('onclick')"><code>onclick</code> Button</button>
		<button type="button" popovertarget="${formId}" popovertargeaction="show">Test Sanitizer &amp; Policy</button>
	</nav>
	<main id="main">
		<p>Bacon ipsum dolor amet fatback boudin jerky pork belly, meatloaf capicola ribeye tri-tip cow flank spare ribs pork loin ham hock beef.  Tenderloin leberkas turkey capicola andouille turducken landjaeger pork porchetta flank hamburger ball tip chislic.  Short ribs cupim ribeye, bacon sausage alcatra chislic brisket tenderloin meatball tri-tip chicken capicola.  Swine meatball cow picanha chislic pig shankle strip steak porchetta beef pastrami.  Tongue alcatra venison cupim pork belly.  Shank short ribs tri-tip meatloaf turducken, bresaola ribeye burgdoggen.</p>
		<p>Andouille bresaola spare ribs pork belly buffalo boudin pig cupim sausage chicken shank jowl ham drumstick.  Leberkas shoulder flank meatloaf buffalo brisket beef ribs swine ham bresaola.  Porchetta meatloaf sausage shankle biltong ground round pork chop salami short ribs beef swine pork belly prosciutto pork loin.  Biltong pork chop strip steak, bresaola jowl bacon capicola shank short ribs.  Kielbasa rump kevin shank, ham corned beef doner meatball cow leberkas tri-tip pork chop swine ground round pork loin.</p>
		<p>Meatball hamburger fatback pork venison pancetta chicken spare ribs prosciutto salami drumstick porchetta ham hock sirloin short loin.  Buffalo boudin cow frankfurter ham andouille filet mignon.  Prosciutto sausage turkey capicola pork loin pastrami.  Ball tip flank pastrami ham brisket ground round filet mignon burgdoggen tri-tip meatball beef chuck pork meatloaf.  Pig short loin flank venison, short ribs landjaeger chislic kielbasa.</p>
		<p>Corned beef frankfurter tenderloin, alcatra salami beef doner kevin t-bone kielbasa cow chicken biltong.  Shoulder brisket pork belly salami turkey ham capicola, bacon meatloaf pork loin.  Short ribs beef bacon drumstick cupim rump turkey ham hock spare ribs.  Rump ball tip doner burgdoggen short ribs chicken venison drumstick salami.  Short ribs picanha hamburger ball tip burgdoggen turkey beef ribs pancetta.  Turkey hamburger kielbasa, capicola tri-tip jerky corned beef jowl filet mignon.</p>
		<p>Corned beef picanha andouille short loin, turducken cupim kielbasa tail bacon cow short ribs filet mignon shank frankfurter beef ribs.  Jerky landjaeger meatloaf capicola kielbasa brisket shoulder alcatra.  Landjaeger swine beef ribs t-bone spare ribs fatback, ham hock short loin alcatra drumstick ribeye.  Jowl chicken short loin, kielbasa ground round short ribs capicola flank strip steak.  Shank bacon hamburger ham hock, beef chicken kevin pig tenderloin tri-tip salami andouille burgdoggen drumstick.  Corned beef alcatra leberkas, prosciutto pork loin chislic shankle ribeye chicken fatback shoulder pork belly jowl.</p>
	</main>
	<aside id="sidebar"></aside>
	<footer id="footer">
		&copy; ${new Date().getFullYear()}
	</footer>
	<form id="${formId}" popover="manual">
		<fieldset>
			<legend>Test Sanitizer &amp; Trusted Types Policy</legend>
			<div>
				<label for="html">Enter some HTML</label>
				<br />
				<textarea name="html" id="html" placeholder="&lt;div&gt;Whatever HTML Here&lt;/div&gt" cols="60" rows="10" required=""></textarea>
			</div>
		</fieldset>
		<div>
			<button type="submit">Test</button>
			<button type="reset" popovertarget="${formId}" popovertargetactin="hide">Cancel</button>
		</div>
	</form>`;

	console.log(document.forms);

	document.forms[formId].addEventListener('submit', event => {
		event.preventDefault();
		const form = event.target;
		const data = new FormData(form);
		const popover = document.createElement('div');
		popover.id = 'popover-' + crypto.randomUUID();
		popover.popover = 'manual';
		popover.innerHTML = `<h2>
			<span>Resulting HTML</span>
			<button type="button" popovertarget="${popover.id}" popovertargetaction="hide">Close</button>
		</h2>
		<div id="result">${data.get('html')}</div>
		<details>
			<summary>Raw HTML</summary>
			<pre><code id="raw"></code></pre>
		</details>
		<details>
			<summary>Input HTML</summary>
			<pre><code id="input"></code></pre>
		</details>`;

		popover.querySelector('#raw').textContent = popover.querySelector('#result').innerHTML;
		popover.querySelector('#input').textContent = data.get('html');
		document.body.append(popover);
		form.hidePopover();
		popover.showPopover();
		popover.addEventListener('toggle', ({ target, newState }) => {
			if (newState !== 'open') {
				target.remove();
			}
		});
	});
});

