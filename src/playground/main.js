// TODO
if (/player\.html|mode=player|mode=coursePlayer/.test(location)) {
    require('./player.jsx');
} else {
    require('./index.jsx');
}
