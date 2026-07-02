package KhanhXuan;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import Xuan.Advance1;

public class Advance1Test {

    private final Advance1 x = new Advance1();

    @Test
    void testUSCLN() {
        assertEquals(4, x.USCLN(8, 4));
    }

    @Test
    void testBSCNN() {
        assertEquals(12, x.BSCNN(4, 6));
    }

    @Test
    void testUSCLN_aZero() {
        assertThrows(IllegalArgumentException.class, () -> x.USCLN(0, 4));
    }

    @Test
    void testBSCNN_bZero() {
        assertThrows(IllegalArgumentException.class, () -> x.BSCNN(4, 0));
    }

    @Test
    void testUSCLN_aNegative() {
        assertThrows(IllegalArgumentException.class, () -> x.USCLN(-4, 4));
    }
}
