package KhanhXuan;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import Xuan.Advance7;

public class Advance7Test {

    private final Advance7 x = new Advance7();

    @Test
    void testTinhThu() {
        assertEquals(1, x.tinhThu(5, 4, 2020));
    }

    @Test
    void testMonday() {
        assertEquals(2, x.tinhThu(6, 4, 2020));
    }

    @Test
    void testInvalidDay() {
        assertEquals(0, x.tinhThu(35, 6, 2019));
    }

    @Test
    void testInvalidMonth() {
        assertEquals(0, x.tinhThu(19, 35, 2020));
    }

    @Test
    void testNegativeDay() {
        assertEquals(0, x.tinhThu(-19, 35, 2020));
    }

    @Test
    void testNegativeMonth() {
        assertEquals(0, x.tinhThu(19, -9, 2020));
    }

    @Test
    void testNegativeYear() {
        assertEquals(0, x.tinhThu(19, 9, -2020));
    }
}
