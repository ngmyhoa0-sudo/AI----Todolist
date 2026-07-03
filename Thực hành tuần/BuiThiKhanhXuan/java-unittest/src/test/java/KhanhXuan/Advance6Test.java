package KhanhXuan;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import Xuan.Advance6;

public class Advance6Test {

    private final Advance6 x = new Advance6();

    @Test
    void testTinhTuoi() {
        assertEquals(27, x.tinhTuoi(12, 1, 1999));
    }

    @Test
    void testFutureYear() {
        assertEquals(-1, x.tinhTuoi(12, 1, 2030));
    }

    @Test
    void testNegativeDay() {
        assertEquals(-1, x.tinhTuoi(-12, 1, 2000));
    }

    @Test
    void testNegativeMonth() {
        assertEquals(-1, x.tinhTuoi(12, -1, 2000));
    }

    @Test
    void testNegativeYear() {
        assertEquals(-1, x.tinhTuoi(12, 1, -2030));
    }
}
