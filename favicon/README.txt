Put these files into your repo like this:

favicon/
  i18n/
    strings.js
    i18n.js

Then load them from favicon/index.html:
<script src="./i18n/strings.js"></script>
<script src="./i18n/i18n.js"></script>

And from subpages:
<script src="../i18n/strings.js"></script>
<script src="../i18n/i18n.js"></script>
