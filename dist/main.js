!function(e){function t(t){for(var r,u,o=t[0],i=t[1],c=t[2],f=0,d=[];f<o.length;f++)u=o[f],a[u]&&d.push(a[u][0]),a[u]=0;for(r in i)Object.prototype.hasOwnProperty.call(i,r)&&(e[r]=i[r]);for(s&&s(t);d.length;)d.shift()();return l.push.apply(l,c||[]),n()}function n(){for(var e,t=0;t<l.length;t++){for(var n=l[t],r=!0,o=1;o<n.length;o++){var i=n[o];0!==a[i]&&(r=!1)}r&&(l.splice(t--,1),e=u(u.s=n[0]))}return e}var r={},a={0:0},l=[];function u(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,u),n.l=!0,n.exports}u.e=function(e){var t=[],n=a[e];if(0!==n)if(n)t.push(n[2]);else{var r=new Promise(function(t,r){n=a[e]=[t,r]});t.push(n[2]=r);var l,o=document.getElementsByTagName("head")[0],i=document.createElement("script");i.charset="utf-8",i.timeout=120,u.nc&&i.setAttribute("nonce",u.nc),i.src=function(e){return u.p+""+({}[e]||e)+".js"}(e),l=function(t){i.onerror=i.onload=null,clearTimeout(c);var n=a[e];if(0!==n){if(n){var r=t&&("load"===t.type?"missing":t.type),l=t&&t.target&&t.target.src,u=new Error("Loading chunk "+e+" failed.\n("+r+": "+l+")");u.type=r,u.request=l,n[1](u)}a[e]=void 0}};var c=setTimeout(function(){l({type:"timeout",target:i})},12e4);i.onerror=i.onload=l,o.appendChild(i)}return Promise.all(t)},u.m=e,u.c=r,u.d=function(e,t,n){u.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},u.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},u.t=function(e,t){if(1&t&&(e=u(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(u.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)u.d(n,r,function(t){return e[t]}.bind(null,r));return n},u.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return u.d(t,"a",t),t},u.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},u.p="",u.oe=function(e){throw console.error(e),e};var o=window.webpackJsonp=window.webpackJsonp||[],i=o.push.bind(o);o.push=t,o=o.slice();for(var c=0;c<o.length;c++)t(o[c]);var s=i;l.push([17,1]),n()}([,,,,,,function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.receivePlayerDetail=t.receiveMatches=t.receivePlayers=t.addMatch=t.addPlayer=void 0,t.loadPlayers=c,t.loadPlayerDetail=function(e){return function(t){return fetch("/api/players/"+e+"/elo_entries").then(function(e){return e.json()},function(e){return console.log(e)}).then(function(n){return t(i(e,n))},function(e){return console.log(e)})}},t.loadMatches=function(){return function(e){return fetch("/api/matches").then(function(e){return e.json()},function(e){return console.log(e)}).then(function(t){return e(o(t))},function(e){return console.log(e)})}},t.createPlayer=function(e){return function(t){return fetch("/api/players",{method:"POST",headers:{"Content-Type":"application/json; charset=utf-8"},body:JSON.stringify(e)}).then(function(e){return e.json()},function(e){return console.log(e)}).then(function(e){return t(a(e))},function(e){return console.log(e)})}},t.createMatch=function(e){return function(t){return fetch("/api/matches",{method:"POST",headers:{"Content-Type":"application/json; charset=utf-8"},body:JSON.stringify(e)}).then(function(e){return e.json()},function(e){return console.log(e)}).then(function(e){t(l(e)),t(c())},function(e){return console.log(e)})}};var r=n(13),a=t.addPlayer=function(e){return{type:r.ADD_PLAYER,payload:e}},l=t.addMatch=function(e){return{type:r.ADD_MATCH,payload:e}},u=t.receivePlayers=function(e){return{type:r.RECEIVE_PLAYERS,payload:e}},o=t.receiveMatches=function(e){return{type:r.RECEIVE_MATCHES,payload:e}},i=t.receivePlayerDetail=function(e,t){return{type:r.RECEIVE_PLAYER_DETAIL,payload:t,playerId:e}};function c(){return function(e){return fetch("/api/players").then(function(e){return e.json()},function(e){return console.log(e)}).then(function(t){return e(u(t))},function(e){return console.log(e)})}}},,,,,,,function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.ADD_PLAYER="ADD_PLAYER",t.ADD_MATCH="ADD_MATCH",t.RECEIVE_PLAYERS="RECEIVE_PLAYERS",t.RECEIVE_MATCHES="RECEIVE_MATCHES",t.RECEIVE_PLAYER_DETAIL="RECEIVE_PLAYER_DETAIL"},,,,function(e,t,n){"use strict";!function(e){e&&e.__esModule}(n(18))},function(e,t,n){"use strict";var r=i(n(1)),a=n(20),l=n(5),u=i(n(27)),o=i(n(30));function i(e){return e&&e.__esModule?e:{default:e}}(0,a.render)(r.default.createElement(l.Provider,{store:u.default},r.default.createElement(o.default,null)),document.getElementById("app"))},,,,,,,,,function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=o(n(28)),a=n(9),l=n(6),u=o(n(29));function o(e){return e&&e.__esModule?e:{default:e}}var i=(0,a.createStore)(u.default,(0,a.applyMiddleware)(r.default));i.dispatch((0,l.loadPlayers)()),i.dispatch((0,l.loadMatches)()),t.default=i},,function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},a=n(13);function l(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}var u={players:[],matches:[],playerDetail:{}};t.default=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:u,t=arguments[1];switch(t.type){case a.ADD_PLAYER:return r({},e,{players:[].concat(l(e.players),[t.payload])});case a.RECEIVE_PLAYERS:return r({},e,{players:t.payload});case a.RECEIVE_MATCHES:return r({},e,{matches:t.payload});case a.ADD_MATCH:return r({},e,{matches:[].concat(l(e.matches),[t.payload])});case a.RECEIVE_PLAYER_DETAIL:return r({},e,{playerDetail:{eloEntries:t.payload,playerId:t.playerId}});default:return e}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=i(n(1)),a=n(14),l=i(n(32)),u=i(n(35)),o=i(n(37));function i(e){return e&&e.__esModule?e:{default:e}}n(40),n(42);var c=function(){return r.default.createElement("div",{className:"container"},r.default.createElement("div",{className:"tabs is-large is-boxed"},r.default.createElement("ul",null,r.default.createElement("li",null,r.default.createElement(a.NavLink,{to:"/players",activeClassName:"is-active"},"Players")),r.default.createElement("li",null,r.default.createElement(a.NavLink,{to:"/matches",activeClassName:"is-active"},"Matches")))),r.default.createElement(a.Switch,null,r.default.createElement(a.Redirect,{exact:!0,from:"/",to:"/players"}),r.default.createElement(a.Route,{exact:!0,path:"/players",component:l.default}),r.default.createElement(a.Route,{path:"/players/:playerId",component:u.default}),r.default.createElement(a.Route,{path:"/matches",component:o.default})))};t.default=function(){return r.default.createElement(a.HashRouter,null,r.default.createElement(c,null))}},,function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=u(n(1)),a=u(n(33)),l=u(n(34));function u(e){return e&&e.__esModule?e:{default:e}}t.default=function(){return r.default.createElement("div",{className:"players"},r.default.createElement("div",{className:"columns"},r.default.createElement("div",{className:"column is-two-thirds"},r.default.createElement(l.default,null)),r.default.createElement("div",{className:"column is-one-third"},r.default.createElement("h2",null,"Add new player to the roster"),r.default.createElement(a.default,null))))}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),a=n(1),l=function(e){return e&&e.__esModule?e:{default:e}}(a),u=n(5),o=n(6);var i={name:"",elo:1500},c=function(e){function t(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t);var e=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}(this,(t.__proto__||Object.getPrototypeOf(t)).call(this));return e.state=i,e}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}(t,a.Component),r(t,[{key:"handleChange",value:function(e){this.setState(function(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}({},e.target.id,e.target.value))}},{key:"setELO",value:function(e){this.setState({elo:parseFloat(e.target.value)})}},{key:"handleSubmit",value:function(e){e.preventDefault();var t=this.state,n=t.name,r=t.elo;this.props.createPlayer({name:n,elo:r}),this.setState(i)}},{key:"render",value:function(){var e=this.state,t=e.name,n=e.elo;return l.default.createElement("form",{onSubmit:this.handleSubmit.bind(this)},l.default.createElement("div",{className:"field"},l.default.createElement("label",{htmlFor:"name",className:"label"},"Name"),l.default.createElement("input",{type:"text",className:"input is-primary",id:"name",placeholder:"Enter the player's name",value:t,onChange:this.handleChange.bind(this)})),l.default.createElement("div",{className:"field"},l.default.createElement("label",{htmlFor:"elo",className:"label"},"Initial Elo"),l.default.createElement("input",{type:"number",className:"input is-primary",id:"elo",placeholder:"Enter the player's starting Elo score",value:n,onChange:this.setELO.bind(this)})),l.default.createElement("button",{type:"submit",className:"button is-primary"},"Create Player"))}}]),t}(),s=(0,u.connect)(null,function(e){return{createPlayer:function(t){return e((0,o.createPlayer)(t))}}})(c);t.default=s},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=function(e){return e&&e.__esModule?e:{default:e}}(n(1)),a=n(5),l=n(14);var u=(0,a.connect)(function(e){return{players:e.players}})(function(e){var t=e.players;return r.default.createElement("table",{className:"table"},r.default.createElement("thead",null,r.default.createElement("tr",null,r.default.createElement("th",null,"Player Name"),r.default.createElement("th",null,"Current Elo"))),r.default.createElement("tbody",null,t.map(function(e){return r.default.createElement("tr",{key:e.id},r.default.createElement("th",null,r.default.createElement(l.Link,{to:"/players/"+e.id},e.name)),r.default.createElement("td",null,e.elo))})))});t.default=u},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),a=o(n(1)),l=n(5),u=n(6);function o(e){return e&&e.__esModule?e:{default:e}}var i=(0,o(n(36)).default)({loader:function(){return n.e(2).then(n.t.bind(null,44,7))},loading:function(){return a.default.createElement("div",null,"Loading...")}}),c=function(e){function t(){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments))}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}(t,a.default.Component),r(t,[{key:"hasValidDetailsLoaded",value:function(){return this.props.playerDetail.playerId==this.props.match.params.playerId}},{key:"hasPlayersLoaded",value:function(){return this.props.players.length>0}},{key:"getChartData",value:function(){return[{x:this.props.playerDetail.eloEntries.map(function(e){return e.created_at}),y:this.props.playerDetail.eloEntries.map(function(e){return e.score}),type:"scatter",mode:"lines+points",marker:{color:"red"}}]}},{key:"getChartTitle",value:function(){var e=this;return"Elo Score over time for "+this.props.players.find(function(t){return t.id==e.props.match.params.playerId}).name}},{key:"componentDidMount",value:function(){this.hasValidDetailsLoaded()||this.props.loadPlayerDetail(this.props.match.params.playerId)}},{key:"render",value:function(){return this.hasValidDetailsLoaded()&&this.hasPlayersLoaded()?a.default.createElement(i,{data:this.getChartData(),layout:{width:"70%",height:"70%",title:this.getChartTitle()}}):a.default.createElement("div",null,"Loading...")}}]),t}();t.default=(0,l.connect)(function(e){return{players:e.players,playerDetail:e.playerDetail}},function(e){return{loadPlayerDetail:function(t){return e((0,u.loadPlayerDetail)(t))}}})(c)},,function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=u(n(1)),a=u(n(38)),l=u(n(39));function u(e){return e&&e.__esModule?e:{default:e}}t.default=function(){return r.default.createElement("div",{className:"matches"},r.default.createElement("div",{className:"columns"},r.default.createElement("div",{className:"column is-two-thirds"},r.default.createElement(l.default,null)),r.default.createElement("div",{className:"column is-one-third"},r.default.createElement("h2",null,"Record a match"),r.default.createElement(a.default,null))))}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),a=n(1),l=function(e){return e&&e.__esModule?e:{default:e}}(a),u=n(5),o=n(6);var i={contestants:[],winner:null,comment:null},c=function(e){function t(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t);var e=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}(this,(t.__proto__||Object.getPrototypeOf(t)).call(this));return e.state=i,e}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}(t,a.Component),r(t,[{key:"handleSubmit",value:function(e){e.preventDefault();var t=function(e){switch(e){case"player1":return[1,0];case"player2":return[0,1];case"draw":return[.5,.5]}}(this.state.winner);this.props.createMatch({player1_id:this.state.contestants[0].id,player2_id:this.state.contestants[1].id,player1_score:t[0],player2_score:t[1],comment:this.state.comment}),this.setState(i)}},{key:"playersSelected",value:function(e){var t=this,n=[].slice.call(e.target.selectedOptions).map(function(e){return t.props.players.find(function(t){return t.id==parseInt(e.value)})});this.setState({contestants:n})}},{key:"setComment",value:function(e){var t=e.target.value;t&&""!=t.trim()||(t=null),this.setState({comment:t})}},{key:"canSubmit",value:function(){return 2==this.state.contestants.length&&null!=this.state.winner}},{key:"winnerSelected",value:function(e){this.setState({winner:e.target.value})}},{key:"render",value:function(){var e=this.state,t=e.contestants,n=e.winner;return l.default.createElement("form",{onSubmit:this.handleSubmit.bind(this)},l.default.createElement("div",{className:"select is-multiple"},l.default.createElement("select",{multiple:!0,id:"players",onChange:this.playersSelected.bind(this)},this.props.players.map(function(e){return l.default.createElement("option",{key:e.id,value:e.id},e.name)}))),2==t.length&&l.default.createElement("div",{className:"control"},l.default.createElement("label",null,"Winner: "),l.default.createElement("label",{className:"radio"},l.default.createElement("input",{type:"radio",name:"winner",value:"player1",checked:"player1"==n,onChange:this.winnerSelected.bind(this)}),t[0].name),l.default.createElement("label",{className:"radio"},l.default.createElement("input",{type:"radio",name:"winner",value:"player2",checked:"player2"==n,onChange:this.winnerSelected.bind(this)}),t[1].name),l.default.createElement("label",{className:"radio"},l.default.createElement("input",{type:"radio",name:"winner",value:"draw",checked:"draw"==n,onChange:this.winnerSelected.bind(this)}),"Draw")),l.default.createElement("div",{className:"control"},l.default.createElement("input",{className:"input",name:"comment",placeholder:"Match comments",onChange:this.setComment.bind(this)})),l.default.createElement("button",{type:"submit",className:"button is-primary",disabled:!this.canSubmit()},"SAVE"))}}]),t}(),s=(0,u.connect)(function(e){return{players:e.players}},function(e){return{createMatch:function(t){return e((0,o.createMatch)(t))}}})(c);t.default=s},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=function(e){return e&&e.__esModule?e:{default:e}}(n(1));var a=(0,n(5).connect)(function(e){return{matches:e.matches,players:e.players}})(function(e){var t=e.matches,n=e.players;return r.default.createElement("table",{className:"table"},r.default.createElement("thead",null,r.default.createElement("tr",null,r.default.createElement("th",null,"Date"),r.default.createElement("th",null,"Outcome"),r.default.createElement("th",null,"Comment"))),r.default.createElement("tbody",null,t.map(function(e){return r.default.createElement("tr",{key:e.id},r.default.createElement("td",null,e.created_at),r.default.createElement("td",null,function(e,t){var n=t.find(function(t){return t.id==e.player1_id}).name,r=t.find(function(t){return t.id==e.player2_id}).name;return e.player1_score==e.player2_score?n+" drew against "+r:e.player1_score>e.player2_score?n+" def. "+r:r+" def. "+n}(e,n)),r.default.createElement("td",null,e.comment))})))});t.default=a},,,function(e,t,n){}]);