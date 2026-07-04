import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';
import { IsDateString } from 'class-validator';
import { IsString } from 'class-validator';

class SchedulePostDto {
  @IsString()
  @IsDateString()
  scheduledAt: string;
}

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * POST /posts
   * Create a new post. Authors, Editors, Admins and Super Admins can create.
   */
  @Post()
  @Roles(Role.AUTHOR, Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN)
  create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.postsService.create(createPostDto, user);
  }

  /**
   * GET /posts
   * List all posts with pagination, status, category, tag, and author filters.
   */
  @Get()
  findAll(@Query() query: PostQueryDto) {
    return this.postsService.findAll(query);
  }

  /**
   * GET /posts/:id
   * Get a single post by UUID.
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }

  /**
   * GET /posts/slug/:slug
   * Get a single post by its slug.
   */
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  /**
   * PUT /posts/:id
   * Update a post. Authors can only update their own posts (enforced in service).
   */
  @Put(':id')
  @Roles(Role.AUTHOR, Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.postsService.update(id, updatePostDto, user);
  }

  /**
   * DELETE /posts/:id
   * Delete a post. Requires ADMIN or SUPER_ADMIN role.
   */
  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.postsService.remove(id, user);
  }

  /**
   * PATCH /posts/:id/publish
   * Publish a post immediately. Requires EDITOR or higher.
   */
  @Patch(':id/publish')
  @Roles(Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN)
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.postsService.publish(id, user);
  }

  /**
   * PATCH /posts/:id/unpublish
   * Unpublish a post (revert to DRAFT). Requires EDITOR or higher.
   */
  @Patch(':id/unpublish')
  @Roles(Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN)
  unpublish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.postsService.unpublish(id, user);
  }

  /**
   * PATCH /posts/:id/schedule
   * Schedule a post for future publication. Requires EDITOR or higher.
   */
  @Patch(':id/schedule')
  @Roles(Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN)
  schedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SchedulePostDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.postsService.schedule(id, body.scheduledAt, user);
  }
}
