---
title: Farming
weight: 5
menu: false
---
<style type="text/css">
    pre { background-color: black; color: white; padding: 1em; }
    pre .error { background-color: #A00; color: white; }
    pre .info { color: #0A0; }
    pre .comment { color: #AC0 }
</style>
<div id="root"></div>
<script type="text/javascript">

    /* global require */ require(['react-dom', 'views/Game/Farming'], function (ReactDOM, Farming) {
        ReactDOM.render(Farming(), document.getElementById('root'));
    });

</script>
