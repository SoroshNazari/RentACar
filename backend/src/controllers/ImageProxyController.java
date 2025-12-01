package de.rentacar.shared.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * Liefert entfernte Bilder über den eigenen Origin aus, um Browser-ORB/CORP-Blockaden zu vermeiden.
 * Warum: Einige CDNs setzen restriktive CORP-Header. Durch Proxy-Auslieferung vermeiden wir Cross-Origin-Probleme.
 */
@RestController
public class ImageProxyController {
    private static final Logger log = LoggerFactory.getLogger(ImageProxyController.class);

    private static final int MAX_BYTES = 2 * 1024 * 1024; // 2MB Limit

    /**
     * Proxy für Bild-URLs. Nur erlaubte Hosts werden bedient, um SSRF zu verhindern.
     */
    @GetMapping("/api/assets/image")
    public ResponseEntity<byte[]> proxyImage(@RequestParam("url") String urlParam) {
        try {
            URL url = new URL(urlParam);
            String host = url.getHost().toLowerCase();
            if (!(host.equals("images.unsplash.com") || host.equals("source.unsplash.com") || host.equals("picsum.photos") || host.equals("fastly.picsum.photos"))) {
                log.warn("Blocked image proxy for host: {}", host);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(("Host not allowed: " + host).getBytes(StandardCharsets.UTF_8));
            }

            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(5000);
            conn.setRequestProperty("Accept", "image/*");
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36");
            conn.setRequestProperty("Referer", "https://" + host + "/");
            conn.setInstanceFollowRedirects(true);

            int status = conn.getResponseCode();
            if (status >= 300 && status < 400) {
                String loc = conn.getHeaderField("Location");
                conn.disconnect();
                conn = (HttpURLConnection) new URL(loc).openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(3000);
                conn.setReadTimeout(5000);
                conn.setRequestProperty("Accept", "image/*");
                conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36");
                conn.setRequestProperty("Referer", "https://" + host + "/");
                status = conn.getResponseCode();
            }

            if (status >= 400) {
                try (InputStream es = conn.getErrorStream()) {
                    byte[] err = es != null ? StreamUtils.copyToByteArray(es) : ("HTTP " + status).getBytes(StandardCharsets.UTF_8);
                    return ResponseEntity.status(status).body(err);
                } finally {
                    conn.disconnect();
                }
            }

            try (InputStream is = conn.getInputStream()) {
                byte[] data = StreamUtils.copyToByteArray(is);
                if (data.length > MAX_BYTES) {
                    return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                            .body("Image too large".getBytes(StandardCharsets.UTF_8));
                }
                String contentType = conn.getContentType();
                MediaType mt = (contentType != null && contentType.startsWith("image/")
                        ? MediaType.parseMediaType(contentType) : MediaType.IMAGE_JPEG);
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(mt);
                headers.add("Cache-Control", "max-age=3600, public");
                return new ResponseEntity<>(data, headers, HttpStatus.OK);
            } finally {
                conn.disconnect();
            }
        } catch (Exception ex) {
            log.error("Image proxy failed: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(("Image proxy error: " + ex.getMessage()).getBytes(StandardCharsets.UTF_8));
        }
    }
}
