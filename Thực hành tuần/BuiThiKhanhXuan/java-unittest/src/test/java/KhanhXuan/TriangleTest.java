package KhanhXuan;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import Xuan.Triangle;

public class TriangleTest {

    @Test
    void test1() {
        Triangle x = new Triangle(9, 4, 1);
        assertTrue(x.getNumber1() >= x.getNumber2() && x.getNumber1() > x.getNumber3());
    }

    @Test
    void test2() {
        Triangle x = new Triangle(4, 9, 1);
        assertEquals(9, x.maxLength());
    }

    @Test
    void test3() {
        Triangle x = new Triangle(4, 1, 9);
        assertEquals(9, x.maxLength());
    }
}
