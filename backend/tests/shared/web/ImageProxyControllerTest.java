package de.rentacar.shared.web;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class ImageProxyControllerTest {

    @Test
    public void blocksDisallowedHostsWith403() {
        ImageProxyController ctrl = new ImageProxyController();
        ResponseEntity<byte[]> resp = ctrl.proxyImage("http://example.com/image.jpg");
        Assertions.assertEquals(HttpStatus.FORBIDDEN, resp.getStatusCode());
        Assertions.assertNotNull(resp.getBody());
        Assertions.assertTrue(new String(resp.getBody()).contains("Host not allowed"));
    }

    @Test
    public void returnsBadRequestOnMalformedUrl() {
        ImageProxyController ctrl = new ImageProxyController();
        ResponseEntity<byte[]> resp = ctrl.proxyImage("ht!tp:/bad");
        Assertions.assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
        Assertions.assertNotNull(resp.getBody());
        Assertions.assertTrue(new String(resp.getBody()).contains("Image proxy error"));
    }
}

