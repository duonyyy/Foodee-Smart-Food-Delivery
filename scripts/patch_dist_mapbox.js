const fs = require('fs');
const file = '/app/dist/infra/mapbox/mapbox.service.js';
let content = fs.readFileSync(file, 'utf8');
const oldSnippet = `getDistanceAndDuration(origin, destination) {
        return this.getDistanceAndDurationFromMapbox(origin, destination);
    }`;
const newSnippet = `async getDistanceAndDuration(origin, destination) {
        const result = await this.getDistanceAndDurationFromMapbox(origin, destination);
        if (result) return result;
        const [lng1, lat1] = origin;
        const [lng2, lat2] = destination;
        if (lat1 != null && lng1 != null && lat2 != null && lng2 != null && !isNaN(lat1) && !isNaN(lng1) && !isNaN(lat2) && !isNaN(lng2)) {
            const distanceKm = this.calculateHaversineDistance(lat1, lng1, lat2, lng2);
            const durationMin = Math.max(10, Math.round(distanceKm * 3));
            return { distanceKm, durationMin };
        }
        return null;
    }`;

if (content.includes(oldSnippet)) {
  content = content.replace(oldSnippet, newSnippet);
  fs.writeFileSync(file, content, 'utf8');
  console.log('SUCCESSFULLY_PATCHED_DIST');
} else {
  console.log('Snippet not found, check content');
}
