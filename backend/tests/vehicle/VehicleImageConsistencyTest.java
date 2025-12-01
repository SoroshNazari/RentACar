package de.rentacar.vehicle;

import de.rentacar.vehicle.domain.Vehicle;
import de.rentacar.vehicle.domain.VehicleRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Validiert, dass jedes Fahrzeug ein marken-/modellkonsistentes Bild besitzt
 * und die Galerie genau drei markenkonforme Bilder enthält.
 *
 * Warum: Verhindert Fehldarstellungen (z. B. Porsche-Bild bei Audi Q5).
 */
@SpringBootTest
public class VehicleImageConsistencyTest {

    @Autowired
    private VehicleRepository vehicleRepository;

    private static final Map<String, Set<String>> ALLOWED_GALLERY_PREFIXES_BY_BRAND = Map.of(
            "audi", Set.of(
                    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6",
                    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
                    "https://images.unsplash.com/photo-1593941707882-a5bac6861d75"
            ),
            "bmw", Set.of(
                    "https://images.unsplash.com/photo-1555215695-3004980ad54e",
                    "https://images.unsplash.com/photo-1593941707882-a5bac6861d75",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d"
            ),
            "mercedes", Set.of(
                    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
                    "https://images.unsplash.com/photo-1593941707882-a5bac6861d75"
            ),
            "vw", Set.of(
                    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6",
                    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
                    "https://images.unsplash.com/photo-1593941707882-a5bac6861d75"
            ),
            "volkswagen", Set.of(
                    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6",
                    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
                    "https://images.unsplash.com/photo-1593941707882-a5bac6861d75"
            ),
            "porsche", Set.of(
                    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70"
            )
    );

    private static final Map<String, Set<String>> ALLOWED_IMAGEURL_PREFIXES_BY_BRAND = Map.of(
            "audi", Set.of(
                    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
                    "https://images.unsplash.com/photo-1593941707882-a5bac6861d75",
                    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7"
            ),
            "bmw", Set.of(
                    "https://images.unsplash.com/photo-1555215695-3004980ad54e",
                    "https://images.unsplash.com/photo-1593941707882-a5bac6861d75",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d"
            ),
            "mercedes", Set.of(
                    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
                    "https://images.unsplash.com/photo-1593941707882-a5bac6861d75"
            ),
            "vw", Set.of(
                    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6",
                    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
                    "https://images.unsplash.com/photo-1593941707882-a5bac6861d75"
            ),
            "volkswagen", Set.of(
                    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6",
                    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
                    "https://images.unsplash.com/photo-1593941707882-a5bac6861d75"
            ),
            "porsche", Set.of(
                    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70"
            )
    );

    @Test
    public void allVehiclesHaveConsistentImages() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        Assertions.assertFalse(vehicles.isEmpty(), "Es wurden keine Fahrzeuge geladen");

        for (Vehicle v : vehicles) {
            String brand = v.getBrand().toLowerCase();

            // Galerie: exakt 3 Bilder und alle passend zur Marke
            List<String> gallery = v.getImageGallery();
            Assertions.assertNotNull(gallery, () -> "Galerie fehlt bei " + v.getBrand() + " " + v.getModel());
            Assertions.assertEquals(3, gallery.size(), () -> "Galeriegröße != 3 bei " + v.getBrand() + " " + v.getModel());

            Set<String> allowedGallery = ALLOWED_GALLERY_PREFIXES_BY_BRAND.get(brand);
            Assertions.assertNotNull(allowedGallery, () -> "Keine erlaubten Gallery-Präfixe für Marke: " + v.getBrand());

            for (String url : gallery) {
                Assertions.assertTrue(startsWithAny(url, allowedGallery), () ->
                        "Galerie-Bild nicht markenkonform: " + url + " bei " + v.getBrand() + " " + v.getModel());
            }

            // Hauptbild: muss ebenfalls zu Marke passen
            if (v.getImageUrl() != null && !v.getImageUrl().isBlank()) {
                Set<String> allowedMain = ALLOWED_IMAGEURL_PREFIXES_BY_BRAND.get(brand);
                Assertions.assertNotNull(allowedMain, () -> "Keine erlaubten ImageURL-Präfixe für Marke: " + v.getBrand());
                Assertions.assertTrue(startsWithAny(v.getImageUrl(), allowedMain), () ->
                        "Hauptbild nicht markenkonform: " + v.getImageUrl() + " bei " + v.getBrand() + " " + v.getModel());
            }
        }
    }

    private boolean startsWithAny(String url, Set<String> prefixes) {
        for (String p : prefixes) {
            if (url.startsWith(p)) return true;
        }
        return false;
    }
}

