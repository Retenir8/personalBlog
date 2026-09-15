package work.foofish.course.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

/**
 * Cloudflare R2 存储配置类
 * 使用 AWS S3 SDK 连接 Cloudflare R2
 */
@Configuration
public class R2StorageConfig {

    /**
     * R2 存储配置属性
     */
    @Configuration
    @ConfigurationProperties(prefix = "cloudflare.r2")
    public static class R2Properties {
        private String accessKey;
        private String secretKey;
        private String bucketName;
        private String endpoint;
        private String region = "auto";
        private String publicUrl;

        // Getters and Setters
        public String getAccessKey () {
            return accessKey;
        }

        public void setAccessKey (String accessKey) {
            this.accessKey = accessKey;
        }

        public String getSecretKey () {
            return secretKey;
        }

        public void setSecretKey (String secretKey) {
            this.secretKey = secretKey;
        }

        public String getBucketName () {
            return bucketName;
        }

        public void setBucketName (String bucketName) {
            this.bucketName = bucketName;
        }

        public String getEndpoint () {
            return endpoint;
        }

        public void setEndpoint (String endpoint) {
            this.endpoint = endpoint;
        }

        public String getRegion () {
            return region;
        }

        public void setRegion (String region) {
            this.region = region;
        }

        public String getPublicUrl () {
            return publicUrl;
        }

        public void setPublicUrl (String publicUrl) {
            this.publicUrl = publicUrl;
        }
    }

    /**
     * 创建 S3 客户端 Bean
     * 配置为连接 Cloudflare R2
     */
    @Bean
    public S3Client s3Client (R2Properties r2Properties) {
        // 创建 AWS 凭证
        AwsBasicCredentials credentials = AwsBasicCredentials.create(
                r2Properties.getAccessKey(),
                r2Properties.getSecretKey()
        );

        // 配置 S3 客户端以使用路径样式访问（R2 要求）
        S3Configuration s3Config = S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .build();

        // 构建 S3 客户端
        return S3Client.builder()
                .endpointOverride(URI.create(r2Properties.getEndpoint()))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .region(Region.of(r2Properties.getRegion()))
                .serviceConfiguration(s3Config)
                .build();
    }

    /**
     * 注册 R2Properties Bean
     */
    @Bean
    public R2Properties r2Properties () {
        return new R2Properties();
    }
}

