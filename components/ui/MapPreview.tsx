import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface MapPreviewProps {
  address: string;
  onAddressChange: (address: string) => void;
  height?: number;
}

export default function MapPreview({ address, onAddressChange, height = 200 }: MapPreviewProps) {
  const [lat, setLat] = useState(-12.0464);
  const [lng, setLng] = useState(-77.0428);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const iframeRef = useRef<any>(null);
  
  // Track if the change originated from the map to prevent infinite loops
  const isMapUpdateRef = useRef(false);

  // When address changes (by typing), we debounce and fetch coordinates
  useEffect(() => {
    if (!address || address.trim() === '') return;
    if (isMapUpdateRef.current) {
      isMapUpdateRef.current = false;
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      try {
        setIsGeocoding(true);
        // Nominatim OpenStreetMap API for geocoding
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
        const data = await res.json();
        
        if (data && data.length > 0) {
          const newLat = parseFloat(data[0].lat);
          const newLng = parseFloat(data[0].lon);
          setLat(newLat);
          setLng(newLng);
          
          if (Platform.OS === 'web' && iframeRef.current) {
            iframeRef.current.contentWindow?.postMessage(
              JSON.stringify({ type: 'updateLocation', lat: newLat, lng: newLng }),
              '*'
            );
          }
        }
      } catch (e) {
        console.error('Geocoding error:', e);
      } finally {
        setIsGeocoding(false);
      }
    }, 1200);
    
    return () => clearTimeout(timeoutId);
  }, [address]);

  // Listen to messages from iframe (when user clicks on map)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleMessage = async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'mapClick') {
          const newLat = data.lat;
          const newLng = data.lng;
          setLat(newLat);
          setLng(newLng);
          
          // Reverse geocode to get address
          setIsGeocoding(true);
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`);
          const geoData = await res.json();
          if (geoData && geoData.display_name) {
            isMapUpdateRef.current = true; // Mark as map update
            
            // Format address (simplify it a bit)
            const parts = geoData.display_name.split(', ');
            // Take the first 3 relevant parts to not make it too long
            const simplifiedAddress = parts.slice(0, 3).join(', ');
            
            onAddressChange(simplifiedAddress);
          }
        }
      } catch (e) {
        // Ignore non-JSON messages or reverse geocoding errors
      } finally {
        setIsGeocoding(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAddressChange]);

  if (Platform.OS === 'web') {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${lat}, ${lng}], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(map);
          var marker = L.marker([${lat}, ${lng}]).addTo(map);
          
          map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            window.parent.postMessage(JSON.stringify({ type: 'mapClick', lat: e.latlng.lat, lng: e.latlng.lng }), '*');
          });

          window.addEventListener('message', function(event) {
            try {
              var data = JSON.parse(event.data);
              if (data.type === 'updateLocation') {
                var latlng = [data.lat, data.lng];
                marker.setLatLng(latlng);
                map.setView(latlng, 15);
              }
            } catch(e) {}
          });
        </script>
      </body>
      </html>
    `;

    return (
      <View style={[styles.container, { height }]}>
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: 16 } as any}
          title="Mapa de entrega interactivo"
        />
        
        {/* Loading overlay for geocoding */}
        {isGeocoding ? (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingBadge}>
              <ActivityIndicator color={Colors.primary} size="small" />
              <Text style={styles.loadingText}>Buscando...</Text>
            </View>
          </View>
        ) : null}
      </View>
    );
  }

  // Fallback for native without webview (visual placeholder)
  return (
    <View style={[styles.container, styles.fallbackContainer, { height }]}>
      <View style={styles.fallbackContent}>
        <View style={styles.pinWrapper}>
          <Ionicons name="location" size={40} color={Colors.primary} />
        </View>
        <Text style={styles.fallbackTitle}>
          {address || 'Ingresa una dirección'}
        </Text>
        <Text style={styles.fallbackSubtitle}>
          Mapa disponible en la versión web
        </Text>
      </View>
      {/* Decorative grid lines */}
      <View style={styles.gridOverlay}>
        {[...Array(4)].map((_, i) => (
          <View key={`h${i}`} style={[styles.gridLine, styles.gridHorizontal, { top: `${(i + 1) * 20}%` }]} />
        ))}
        {[...Array(4)].map((_, i) => (
          <View key={`v${i}`} style={[styles.gridLine, styles.gridVertical, { left: `${(i + 1) * 20}%` }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    backgroundColor: '#EEF2F7',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  loadingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  fallbackContainer: {
    backgroundColor: '#EEF2F7',
  },
  fallbackContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  pinWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  fallbackTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  fallbackSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  gridHorizontal: {
    left: 0,
    right: 0,
    height: 1,
  },
  gridVertical: {
    top: 0,
    bottom: 0,
    width: 1,
  },
});
