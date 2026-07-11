'use strict';
'require baseclass';
'require rpc';

document.head.append(E('style', {'type': 'text/css'},
`
:root {
	--app-temp-status-font-color: #2e2e2e;
	--app-temp-status-border-color: var(--border-color-medium, #d4d4d4);
	--app-temp-status-card-bg: var(--background-color-high, #fff);
	--app-temp-status-muted: #73808c;
	--app-temp-status-normal: #22a06b;
	--app-temp-status-hot: #e59b18;
	--app-temp-status-overheat: #df4b4b;
}
:root[data-darkmode="true"] {
	--app-temp-status-font-color: #fff;
	--app-temp-status-border-color: var(--border-color-medium, #444);
	--app-temp-status-card-bg: var(--background-color-high, #24282d);
	--app-temp-status-muted: #aab3bb;
}
.luci-temp-status-widget .temp-status-hot {
	--temp-status-accent: var(--app-temp-status-hot);
}
.luci-temp-status-widget .temp-status-overheat {
	--temp-status-accent: var(--app-temp-status-overheat);
}
.luci-temp-status-widget .tr.temp-status-hot {
	background: rgba(229, 155, 24, .12);
}
.luci-temp-status-widget .tr.temp-status-overheat {
	background: rgba(223, 75, 75, .12);
}

.luci-temp-status-widget .temp-status-temp-area {
	width: 100%;
	padding: 0 0 1em;
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
	gap: 12px;
}
.luci-temp-status-widget .temp-status-list-item {
	--temp-status-accent: var(--app-temp-status-normal);
	position: relative;
	min-width: 0;
	padding: 15px 16px 12px;
	overflow: hidden;
	color: var(--app-temp-status-font-color);
	background: var(--app-temp-status-card-bg);
	border: 1px solid var(--app-temp-status-border-color);
	border-top: 3px solid var(--temp-status-accent);
	border-radius: 9px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, .06);
}
.luci-temp-status-widget .temp-status-card-head {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 10px;
}
.luci-temp-status-widget .temp-status-card-actions {
	display: flex;
	align-items: center;
	gap: 6px;
}
.luci-temp-status-widget .temp-status-card-title {
	display: flex;
	min-width: 0;
	flex-direction: column;
	gap: 3px;
}
.luci-temp-status-widget .temp-status-source-kind {
	color: var(--app-temp-status-muted);
	font-size: 10px;
	font-weight: 600;
	letter-spacing: .06em;
	line-height: 1;
	text-transform: uppercase;
}
.luci-temp-status-widget .temp-status-sensor-name {
	min-width: 0;
	overflow: hidden;
	font-weight: 600;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.luci-temp-status-widget .temp-status-state {
	padding: 2px 8px;
	flex: 0 0 auto;
	color: var(--temp-status-accent);
	background: rgba(100, 100, 100, .10);
	background: color-mix(in srgb, var(--temp-status-accent) 12%, transparent);
	border-radius: 99px;
	font-size: 11px;
	font-weight: 600;
}
.luci-temp-status-widget .temp-status-reading {
	display: flex;
	align-items: baseline;
	margin: 12px 0 2px;
	color: var(--temp-status-accent);
}
.luci-temp-status-widget .temp-status-temp-value {
	font-size: 32px;
	font-weight: 650;
	line-height: 1;
}
.luci-temp-status-widget .temp-status-unit {
	margin-left: 4px;
	font-size: 14px;
}
.luci-temp-status-widget .temp-status-chart {
	display: block;
	width: 100%;
	height: 72px;
	margin-top: 7px;
}
.luci-temp-status-widget .temp-status-chart-grid {
	stroke: var(--app-temp-status-border-color);
	stroke-width: 1;
	stroke-dasharray: 3 4;
}
.luci-temp-status-widget .temp-status-chart-area {
	fill: var(--temp-status-accent);
	fill-opacity: .10;
}
.luci-temp-status-widget .temp-status-chart-line {
	fill: none;
	stroke: var(--temp-status-accent);
	stroke-width: 2.4;
	stroke-linecap: round;
	stroke-linejoin: round;
}
.luci-temp-status-widget .temp-status-chart-dot {
	fill: var(--app-temp-status-card-bg);
	stroke: var(--temp-status-accent);
	stroke-width: 2;
}
.luci-temp-status-widget .temp-status-card-foot {
	display: flex;
	justify-content: space-between;
	gap: 8px;
	color: var(--app-temp-status-muted);
	font-size: 11px;
}

.luci-temp-status-widget #temp-status-buttons-wrapper {
	margin-bottom: 1em;
}
.luci-temp-status-widget .temp-status-button {
	display: inline-block;
	cursor: pointer;
	margin: 2px 4px 2px 0 !important;
	padding: 5px 9px;
	border: 1px solid;
	border-color: transparent;
	-webkit-border-radius: 4px;
	-moz-border-radius: 4px;
	border-radius: 4px;
	opacity: 0.7;
	background-color: rgba(100 100 100 / 0.2);
}
.luci-temp-status-widget .temp-status-button:hover {
	opacity: 0.9;
}
.luci-temp-status-widget .temp-status-button:active {
	opacity: 1.0;
}
.luci-temp-status-widget .temp-status-hide-item {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	width: 24px;
	height: 24px;
	padding: 0;
	border: 0;
	border-radius: 50%;
	opacity: .65;
	background: rgba(100, 100, 100, .12);
	font-weight: bold;
}
.luci-temp-status-widget .temp-status-hide-item:hover {
	opacity: 0.9;
}
.luci-temp-status-widget .temp-status-hide-item:active {
	opacity: 1.0;
}
@media (max-width: 600px) {
	.luci-temp-status-widget .temp-status-temp-area { grid-template-columns: 1fr; }
	.luci-temp-status-widget .temp-status-list-item { padding: 13px 14px 10px; }
}
`));

return baseclass.extend({
	title          : _('Temperature'),

	viewName       : 'temp-status',

	tempHot        : 95,

	tempOverheat   : 105,

	sensorsData    : null,

	tempData       : null,

	sensorsPath    : [],

	hiddenItems    : new Set(),

	hiddenNum      : E('span', {}),

	tempTable      : E('table', { 'class': 'table' }),

	tempArea       : E('div', { 'class': 'temp-status-temp-area' }),

	tempView       : E('div', {}),

	viewType       : 'cards',

	tempHistory    : {},

	historySize    : 30,

	callSensors : rpc.declare({
		object: 'luci.temp-status',
		method: 'getSensors',
		expect: { '': {} },
	}),

	callTempData: rpc.declare({
		object: 'luci.temp-status',
		method: 'getTempData',
		params: [ 'tpaths' ],
		expect: { '': {} },
	}),

	formatTemp(mc) {
		return Number((mc / 1000).toFixed(1));
	},

	sortFunc(a, b) {
		return (a.number > b.number) ? 1 : (a.number < b.number) ? -1 : 0;
	},

	restoreSettingsFromLocalStorage() {
		let hiddenItems = localStorage.getItem(`luci-app-${this.viewName}-hiddenItems`);
		if(hiddenItems) {
			this.hiddenItems = new Set(hiddenItems.split(','));
		};
		let view = localStorage.getItem(`luci-app-${this.viewName}-view`);
		if(view) {
			this.viewType = (view == 'list') ? 'cards' : view;
		};
	},

	saveSettingsToLocalStorage() {
		localStorage.setItem(
			`luci-app-${this.viewName}-hiddenItems`, Array.from(this.hiddenItems).join(','));
		localStorage.setItem(
			`luci-app-${this.viewName}-view`, this.viewType);
	},

	getSensorKind(sensor, source) {
		let identity = [
			sensor,
			source.label,
			source.item,
			source.path,
		].filter(Boolean).join(' ').toLowerCase();

		if(/coretemp|k10temp|zenpower|x86_pkg_temp|cpu[_ -]?thermal|soc[_ -]?thermal|package id|\bcpu\b/.test(identity)) {
			return _('CPU');
		};
		if(/nvme|drivetemp|smart|sata|scsi|\bhdd\b|\bssd\b/.test(identity)) {
			return _('Storage');
		};
		if(/amdgpu|nouveau|radeon|i915|\bgpu\b/.test(identity)) {
			return _('Graphics');
		};
		if(/iwlwifi|\bath[0-9a-z_ -]*\b|mt76|wifi|wireless|wlan/.test(identity)) {
			return _('Network');
		};
		if(/acpitz|pch_|nct[0-9]|it87|motherboard|mainboard|chipset/.test(identity)) {
			return _('System');
		};

		return _('Sensor');
	},

	appendHistory() {
		if(!this.tempData) {
			return;
		};

		for(let [path, value] of Object.entries(this.tempData)) {
			if(value === undefined || value === null) {
				continue;
			};

			let history = this.tempHistory[path] || (this.tempHistory[path] = []);
			history.push(this.formatTemp(value));

			if(history.length > this.historySize) {
				history.splice(0, history.length - this.historySize);
			};
		};
	},

	makeSparkline(values) {
		let data = (values || []).filter(value => Number.isFinite(value));
		let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('class', 'temp-status-chart');
		svg.setAttribute('viewBox', '0 0 240 72');
		svg.setAttribute('preserveAspectRatio', 'none');
		svg.setAttribute('aria-hidden', 'true');

		let addSvg = (tag, attrs) => {
			let node = document.createElementNS('http://www.w3.org/2000/svg', tag);
			for(let [name, value] of Object.entries(attrs)) {
				node.setAttribute(name, value);
			};
			svg.append(node);
			return node;
		};

		addSvg('line', { 'class': 'temp-status-chart-grid', x1: 0, y1: 36, x2: 240, y2: 36 });

		if(data.length == 0) {
			return svg;
		};

		let min = Math.min(...data);
		let max = Math.max(...data);
		let range = Math.max(max - min, 2);
		let lower = (min + max - range) / 2;
		let chartData = (data.length == 1) ? [ data[0], data[0] ] : data;
		let points = chartData.map((value, index) => {
			let x = index * 240 / (chartData.length - 1);
			let y = 62 - ((value - lower) / range * 52);
			return `${x.toFixed(1)},${Math.max(6, Math.min(66, y)).toFixed(1)}`;
		});

		addSvg('polygon', {
			'class': 'temp-status-chart-area',
			points: `0,68 ${points.join(' ')} 240,68`,
		});
		addSvg('polyline', { 'class': 'temp-status-chart-line', points: points.join(' ') });

		let last = points[points.length - 1].split(',');
		addSvg('circle', {
			'class': 'temp-status-chart-dot', cx: last[0], cy: last[1], r: 3.5,
		});

		return svg;
	},

	makeTempTableContent() {
		this.tempTable.innerHTML = '';
		this.tempTable.append(
				E('tr', { 'class': 'tr table-titles' }, [
					E('th', { 'class': 'th left', 'width': '33%' }, _('Sensor')),
					E('th', { 'class': 'th left' }, _('Temperature')),
					E('th', { 'class': 'th right', 'width': '1%' }, ' '),
				])
			);

		if(this.sensorsData && this.tempData) {
			for(let [k, v] of Object.entries(this.sensorsData)) {
				v.sort(this.sortFunc);

				for(let i of Object.values(v)) {
					let sensor = i.title || i.item;

					if(i.sources === undefined) {
						continue;
					};

					i.sources.sort(this.sortFunc);

					for(let j of i.sources) {
						if(this.hiddenItems.has(j.path)) {
							continue;
						};

						let temp = this.tempData[j.path];
						let name = (j.label !== undefined) ? sensor + " / " + j.label :
							(j.item !== undefined) ? sensor + " / " + j.item.replace(/_input$/, "") : sensor

						if(temp !== undefined && temp !== null) {
							temp = this.formatTemp(temp);
						};

						let tempHot       = NaN;
						let tempOverheat  = NaN;
						let tpoints       = j.tpoints;
						let tpointsString = '';

						if(tpoints) {
							for(let i of Object.values(tpoints)) {
								let t = this.formatTemp(i.temp);
								tpointsString += `&#10;${i.type}: ${t} °C`;

								if(i.type == 'max' || i.type == 'critical' || i.type == 'emergency') {
									if(!(tempOverheat <= t)) {
										tempOverheat = t;
									};
								}
								else if(i.type == 'hot') {
									tempHot = t;
								};
							};
						};

						if(isNaN(tempHot) && isNaN(tempOverheat)) {
							tempHot      = this.tempHot;
							tempOverheat = this.tempOverheat;
						};

						let rowStyle = (temp >= tempOverheat) ? ' temp-status-overheat':
							(temp >= tempHot) ? ' temp-status-hot' : '';

						this.tempTable.append(
							E('tr', {
								'class'    : 'tr' + rowStyle,
								'data-path': j.path ,
							}, [
								E('td', {
										'class'     : 'td left',
										'data-title': _('Sensor')
									},
									(tpointsString.length > 0) ?
									`<span style="cursor:help; border-bottom:1px dotted" data-tooltip="${tpointsString}">${name}</span>` :
									name
								),
								E('td', {
										'class'     : 'td left',
										'data-title': _('Temperature')
									},
									(temp === undefined || temp === null) ? '-' : temp + ' °C'
								),
								E('td', {
										'class'     : 'td right',
										'data-title': _('Hide'),
										'title'     : _('Hide'),
									},
									E('span', {
										'class': 'temp-status-hide-item',
										'title': _('Hide'),
										'click': () => this.hideItem(j.path),
									}, '&#935;'),
								),
							])
						);
					};
				};
			};
		};

		if(this.tempTable.childNodes.length == 1) {
			this.tempTable.append(
				E('tr', { 'class': 'tr placeholder' },
					E('td', { 'class': 'td' },
						E('em', {}, _('No temperature sensors available'))
					)
				)
			);
		};

		return this.tempTable;
	},

	makeTempAreaContent() {
		this.tempArea.innerHTML = '';

		for(let [k, v] of Object.entries(this.sensorsData)) {
			v.sort(this.sortFunc);

			for(let i of Object.values(v)) {
				let sensor = i.title || i.item;

				if(i.sources === undefined) {
					continue;
				};

				i.sources.sort(this.sortFunc);

				for(let j of i.sources) {
					if(this.hiddenItems.has(j.path)) {
						continue;
					};

					let temp = this.tempData[j.path];
					let name = (j.label !== undefined) ? sensor + " / " + j.label :
						(j.item !== undefined) ? sensor + " / " + j.item.replace(/_input$/, "") : sensor

					if(temp !== undefined && temp !== null) {
						temp = this.formatTemp(temp);
					};

					let tempHot       = NaN;
					let tempOverheat  = NaN;
					let tpoints       = j.tpoints;
					let tpointsString = '';

					if(tpoints) {
						for(let i of Object.values(tpoints)) {
							let t = this.formatTemp(i.temp);
							tpointsString += `&#10;${i.type}: ${t} °C`;

							if(i.type == 'max' || i.type == 'critical' || i.type == 'emergency') {
								if(!(tempOverheat <= t)) {
									tempOverheat = t;
								};
							}
							else if(i.type == 'hot') {
								tempHot = t;
							};
						};
					};

					if(isNaN(tempHot) && isNaN(tempOverheat)) {
						tempHot      = this.tempHot;
						tempOverheat = this.tempOverheat;
					};

					let itemStyle = (temp >= tempOverheat) ? ' temp-status-overheat':
						(temp >= tempHot) ? ' temp-status-hot' : '';

					this.tempArea.append(
						E('div', { 'class': 'temp-status-list-item' + itemStyle }, [
							E('span', {
								'class': 'temp-status-hide-item',
								'title': _('Hide'),
								'click': () => this.hideItem(j.path),
							}, '&#935;'),
							E('span', {
								'class': 'temp-status-temp-value',
							}, (temp === undefined || temp === null) ? '-' : temp + ' °C'),
							E('span', {
								'class': 'temp-status-sensor-name'
							}, (tpointsString.length > 0) ?
								`<span style="cursor:help; border-bottom:1px dotted" data-tooltip="${tpointsString}">${name}</span>` :
								name
							),
						])
					);
				};
			};
		};

		if(this.tempArea.childNodes.length == 0) {
			this.tempArea.append(
				E('em', {}, _('No temperature sensors available'))
			);
		};

		return this.tempArea;
	},

	makeTempCardsContent() {
		this.tempArea.innerHTML = '';

		for(let group of Object.values(this.sensorsData)) {
			group.sort(this.sortFunc);

			for(let sensorData of group) {
				let sensor = sensorData.title || sensorData.item;
				if(!sensorData.sources) {
					continue;
				};

				sensorData.sources.sort(this.sortFunc);
				for(let source of sensorData.sources) {
					if(this.hiddenItems.has(source.path)) {
						continue;
					};

					let temp = this.tempData[source.path];
					let name = (source.label !== undefined) ? `${sensor} / ${source.label}` :
						(source.item !== undefined) ? `${sensor} / ${source.item.replace(/_input$/, '')}` : sensor;
					let tempHot = NaN;
					let tempOverheat = NaN;
					let tpointsText = [];
					let sensorKind = this.getSensorKind(sensor, source);

					if(temp !== undefined && temp !== null) {
						temp = this.formatTemp(temp);
					};

					for(let point of Object.values(source.tpoints || {})) {
						let value = this.formatTemp(point.temp);
						if(!Number.isFinite(value) || value < -50 || value > 250) {
							continue;
						};
						tpointsText.push(`${point.type}: ${value} °C`);

						if(point.type == 'max' || point.type == 'critical' || point.type == 'emergency') {
							if(!(tempOverheat <= value)) {
								tempOverheat = value;
							};
						}
						else if(point.type == 'hot') {
							tempHot = value;
						};
					};

					if(isNaN(tempHot) && isNaN(tempOverheat)) {
						tempHot = this.tempHot;
						tempOverheat = this.tempOverheat;
					};

					let itemStyle = (temp >= tempOverheat) ? ' temp-status-overheat' :
						(temp >= tempHot) ? ' temp-status-hot' : '';
					let state = (temp === undefined || temp === null) ? _('Unavailable') :
						(temp >= tempOverheat) ? _('Overheat') :
						(temp >= tempHot) ? _('Hot') : _('Normal');
					let history = this.tempHistory[source.path] || [];
					let validHistory = history.filter(value => Number.isFinite(value));
					let min = validHistory.length ? Math.min(...validHistory) : null;
					let max = validHistory.length ? Math.max(...validHistory) : null;
					let thresholds = [];

					if(!isNaN(tempHot)) {
						thresholds.push(`${_('Hot')} ${tempHot} °C`);
					};
					if(!isNaN(tempOverheat)) {
						thresholds.push(`${_('Max')} ${tempOverheat} °C`);
					};

					this.tempArea.append(E('div', { 'class': 'temp-status-list-item' + itemStyle }, [
						E('div', { 'class': 'temp-status-card-head' }, [
							E('span', { 'class': 'temp-status-card-title' }, [
								E('span', { 'class': 'temp-status-source-kind' }, sensorKind),
								E('span', {
									'class': 'temp-status-sensor-name',
									'title': tpointsText.length ? tpointsText.join('\n') : name,
								}, name),
							]),
							E('span', { 'class': 'temp-status-card-actions' }, [
								E('span', { 'class': 'temp-status-state' }, state),
								E('span', {
									'class': 'temp-status-hide-item',
									'title': _('Hide'),
									'click': () => this.hideItem(source.path),
								}, '×'),
							]),
						]),
						E('div', { 'class': 'temp-status-reading' }, [
							E('span', { 'class': 'temp-status-temp-value' },
								(temp === undefined || temp === null) ? '—' : temp),
							E('span', { 'class': 'temp-status-unit' }, '°C'),
						]),
						this.makeSparkline(history),
						E('div', { 'class': 'temp-status-card-foot' }, [
							E('span', {}, (min === null) ? _('Collecting data…') :
								`${_('Range')} ${min}–${max} °C`),
							E('span', {}, thresholds.join(' · ')),
						]),
					]));
				};
			};
		};

		if(this.tempArea.childNodes.length == 0) {
			this.tempArea.append(E('em', {}, _('No temperature sensors available')));
		};

		return this.tempArea;
	},

	makeViewContent() {
		this.tempView.innerHTML = '';
		this.tempView.append((this.viewType == 'cards') ? this.makeTempCardsContent() : this.makeTempTableContent());
		this.hiddenNum.textContent = this.hiddenItems.size;
		let unhide = document.getElementById('temp-status-unhide-all');
		if(unhide) {
			unhide.style.display = (this.hiddenItems.size > 0) ? 'inline-block' : 'none';
		};
	},

	hideItem(path) {
		this.hiddenItems.add(path);
		this.saveSettingsToLocalStorage();
		this.makeViewContent();
	},

	unhideAllItems() {
		this.hiddenItems.clear();
		this.saveSettingsToLocalStorage();
		this.makeViewContent();
	},

	switchView() {
		this.tempView.innerHTML = '';
		this.viewType = (this.viewType == 'cards') ? 'table' : 'cards';
		this.saveSettingsToLocalStorage();
		this.makeViewContent();
	},

	load() {
		this.restoreSettingsFromLocalStorage();
		if(this.sensorsData) {
			return (this.sensorsPath.length > 0) ?
				L.resolveDefault(this.callTempData(this.sensorsPath), null) :
					Promise.resolve(null);
		} else {
			return L.resolveDefault(this.callSensors(), null);
		};
	},

	render(data) {
		if(data) {
			if(!this.sensorsData) {
				this.sensorsData = data.sensors;
				this.sensorsPath = data.temp && new Array(...Object.keys(data.temp));
			};
			this.tempData = data.temp;
			this.appendHistory();
		};

		if(!this.sensorsData || !this.tempData) {
			return;
		};

		this.makeViewContent();

		return E('div', { 'class': 'cbi-section luci-temp-status-widget' }, [
			E('div', { 'id': 'temp-status-buttons-wrapper' }, [
				E('span', {
					'class': 'temp-status-button',
					'click': () => this.switchView(),
				}, _('Switch view')),
				E('span', {
					'id'   : 'temp-status-unhide-all',
					'class': 'temp-status-button',
					'style': `display:${(this.hiddenItems.size > 0) ? 'inline-block' : 'none'}`,
					'click': () => this.unhideAllItems(),
				}, [
					_('Show hidden sensors'),
					' (',
					this.hiddenNum,
					')',
				])
			]),
			this.tempView,
		]);
	},
});
