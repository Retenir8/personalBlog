package work.foofish.course.utils;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class JWTUtil {

    @Value("${jwt.secret-key}")
    private String secretKey;

    @Value("${jwt.refresh-secret-key}")
    private String refreshSecretKey;

    // Token过期时间（秒）
    public static final int EXPIRE_TIME = 60 * 60 * 24;
    // RefreshToken过期时间（秒）
    public static final int REFRESH_EXPIRE_TIME = 2 * 60 * 60;

    // 缓存 Algorithm 对象，避免重复创建
    private final ConcurrentMap<String, Algorithm> algorithmCache = new ConcurrentHashMap<>();

    /**
     * 获取或创建 Algorithm 对象
     */
    private Algorithm getAlgorithm(String key) {
        return algorithmCache.computeIfAbsent(key, Algorithm::HMAC256);
    }

    /**
     * 生成 Token
     *
     * @param accountId  账户ID
     * @param expireTime 过期时间（秒）
     * @param key        密钥
     * @return Token字符串
     */
    public String getToken(String accountId, int expireTime, String key) {
        Date expiresAt = new Date(System.currentTimeMillis() + expireTime * 1000L);
        return JWT.create()
                .withClaim("user_id", accountId)
                .withExpiresAt(expiresAt)
                .sign(getAlgorithm(key));
    }

    /**
     * 生成包含角色信息的 Token
     *
     * @param accountId  账户ID
     * @param role       用户角色
     * @param expireTime 过期时间（秒）
     * @param key        密钥
     * @return Token字符串
     */
    public String getToken(String accountId, String role, int expireTime, String key) {
        Date expiresAt = new Date(System.currentTimeMillis() + expireTime * 1000L);
        return JWT.create()
                .withClaim("user_id", accountId)
                .withClaim("role", role)
                .withExpiresAt(expiresAt)
                .sign(getAlgorithm(key));
    }

    /**
     * 验证并解析 Token
     *
     * @param token Token字符串
     * @param key   密钥
     * @return 解码后的JWT对象
     */
    public DecodedJWT getTokenInfo(String token, String key) {
        return JWT.require(getAlgorithm(key))
                .build()
                .verify(token);
    }

    /**
     * 从 Token 中获取用户 ID
     *
     * @param token Token字符串
     * @param key   密钥
     * @return 用户ID
     */
    public String getUserId(String token, String key) {
        try {
            DecodedJWT decodedJWT = getTokenInfo(token, key);
            return decodedJWT.getClaim("user_id").asString();
        } catch (TokenExpiredException e) {
            throw new RuntimeException("Token 已过期，请重新登录", e);
        } catch (JWTVerificationException e) {
            throw new RuntimeException("Token 无效，请检查后重试", e);
        }
    }

    /**
     * 从 Token 中获取用户角色
     *
     * @param token Token字符串
     * @param key   密钥
     * @return 用户角色
     */
    public String getRole(String token, String key) {
        try {
            DecodedJWT decodedJWT = getTokenInfo(token, key);
            return decodedJWT.getClaim("role").asString();
        } catch (TokenExpiredException e) {
            throw new RuntimeException("Token 已过期，请重新登录", e);
        } catch (JWTVerificationException e) {
            throw new RuntimeException("Token 无效，请检查后重试", e);
        }
    }

    /**
     * 使用默认密钥生成 Token（不包含角色信息，兼容旧代码）
     */
    public String getToken(String accountId) {
        return getToken(accountId, EXPIRE_TIME, secretKey);
    }

    /**
     * 使用默认密钥生成包含角色信息的 Token
     */
    public String getToken(String accountId, String role) {
        return getToken(accountId, role, EXPIRE_TIME, secretKey);
    }

    /**
     * 使用默认密钥生成 Token
     */
    public String getToken(String accountId, int expireTime) {
        return getToken(accountId, expireTime, secretKey);
    }

    /**
     * 使用默认密钥获取用户 ID
     */
    public String getUserId(String token) {
        return getUserId(token, secretKey);
    }

    /**
     * 使用默认密钥获取用户角色
     */
    public String getRole(String token) {
        return getRole(token, secretKey);
    }

    /**
     * 使用刷新密钥生成 Refresh Token
     */
    public String getRefreshToken(String accountId) {
        return getToken(accountId, REFRESH_EXPIRE_TIME, refreshSecretKey);
    }

    /**
     * 使用刷新密钥生成包含角色信息的 Refresh Token
     */
    public String getRefreshToken(String accountId, String role) {
        return getToken(accountId, role, REFRESH_EXPIRE_TIME, refreshSecretKey);
    }

    /**
     * 使用刷新密钥获取用户 ID
     */
    public String getUserIdFromRefreshToken(String token) {
        return getUserId(token, refreshSecretKey);
    }

    /**
     * 使用刷新密钥获取用户角色
     */
    public String getRoleFromRefreshToken(String token) {
        return getRole(token, refreshSecretKey);
    }
}
