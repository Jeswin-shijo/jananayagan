import React, {useMemo} from 'react';
import {View, Text} from 'react-native';
import {WebView} from 'react-native-webview';
import {useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppColors} from '@constants/colors';
import {BorderRadius, Spacing} from '@constants/spacing';
import {FontWeight} from '@constants/typography';
import {HeatIntensity, WardHeat, CONSTITUENCY_CENTER, INTENSITY_WEIGHT} from '@utils/politicianData';
import {TranslationKey} from '@constants/i18n';

// Conventional heat scale (red = hot, teal = cool). Used by the map heat layer
// gradient and by the ward dots/legend so they stay in sync.
export const HEAT_COLORS: Record<HeatIntensity, string> = {
  very_high: '#EF4444',
  high: '#F97316',
  medium: '#FACC15',
  low: '#84CC16',
  very_low: '#5EEAD4',
};

const LEGEND: {intensity: HeatIntensity; labelKey: TranslationKey}[] = [
  {intensity: 'very_high', labelKey: 'intensityVeryHigh'},
  {intensity: 'high', labelKey: 'intensityHigh'},
  {intensity: 'medium', labelKey: 'intensityMedium'},
  {intensity: 'low', labelKey: 'intensityLow'},
  {intensity: 'very_low', labelKey: 'intensityVeryLow'},
];

const buildHtml = (
  wards: WardHeat[],
  labels: {total: string; pending: string; resolved: string},
) => {
  const points = wards.map(w => ({
    lat: w.lat,
    lng: w.lng,
    weight: INTENSITY_WEIGHT[w.intensity],
    color: HEAT_COLORS[w.intensity],
    name: w.name,
    popup: `${labels.total}: ${w.total.toLocaleString()} · ${labels.pending}: ${w.pending} · ${labels.resolved}: ${w.resolved}`,
  }));

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: #E8EEF3; }
  .leaflet-tooltip.ward-tip {
    background: rgba(255,255,255,0.92); border: 1px solid rgba(148,163,184,0.5);
    border-radius: 10px; padding: 1px 7px; font: 600 11px -apple-system, Roboto, system-ui;
    color: #1E293B; box-shadow: 0 1px 4px rgba(0,0,0,0.12);
  }
  .leaflet-tooltip.ward-tip::before { display: none; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"></script>
<script>
  var pts = ${JSON.stringify(points)};
  var c = ${JSON.stringify(CONSTITUENCY_CENTER)};
  var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([c.lat, c.lng], c.zoom);
  L.control.zoom({ position: 'topright' }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
  L.heatLayer(pts.map(function (p) { return [p.lat, p.lng, p.weight]; }), {
    radius: 48, blur: 32, maxZoom: 17, minOpacity: 0.4,
    gradient: { 0.0: '#5EEAD4', 0.25: '#84CC16', 0.5: '#FACC15', 0.75: '#F97316', 1.0: '#EF4444' }
  }).addTo(map);
  pts.forEach(function (p) {
    L.circleMarker([p.lat, p.lng], { radius: 6, color: '#ffffff', weight: 2, fillColor: p.color, fillOpacity: 1 })
      .addTo(map)
      .bindTooltip(p.name, { permanent: true, direction: 'top', className: 'ward-tip', offset: [0, -4] })
      .bindPopup('<b>' + p.name + '</b><br/>' + p.popup);
  });
</script>
</body>
</html>`;
};

interface ConstituencyHeatMapProps {
  wards: WardHeat[];
  height?: number;
}

export const ConstituencyHeatMap: React.FC<ConstituencyHeatMapProps> = ({wards, height = 340}) => {
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();

  const html = useMemo(
    () => buildHtml(wards, {total: t('total'), pending: t('pending'), resolved: t('resolved')}),
    [wards, t],
  );

  return (
    <View style={[styles.panel, {height}]}>
      <WebView
        originWhitelist={['*']}
        source={{html}}
        style={styles.web}
        scrollEnabled={false}
        nestedScrollEnabled
        androidLayerType="hardware"
        domStorageEnabled
        javaScriptEnabled
      />

      {/* Themed legend overlay */}
      <View style={styles.legend} pointerEvents="none">
        <Text style={styles.legendTitle}>{t('issueIntensity')}</Text>
        {LEGEND.map(item => (
          <View key={item.intensity} style={styles.legendRow}>
            <View style={[styles.legendDot, {backgroundColor: HEAT_COLORS[item.intensity]}]} />
            <Text style={styles.legendLabel}>{t(item.labelKey)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const createStyles = (Colors: AppColors) => ({
  panel: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    backgroundColor: '#E8EEF3',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  web: {flex: 1, backgroundColor: '#E8EEF3'},
  legend: {
    position: 'absolute',
    top: Spacing[3],
    left: Spacing[3],
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: BorderRadius.md,
    padding: Spacing[2],
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    zIndex: 10,
  },
  legendTitle: {fontSize: 9, fontWeight: FontWeight.bold, color: '#475569', marginBottom: 4, letterSpacing: 0.5},
  legendRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 2},
  legendDot: {width: 8, height: 8, borderRadius: 4, marginRight: 6},
  legendLabel: {fontSize: 10, color: '#475569'},
} as const);
